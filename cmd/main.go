package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/google/uuid"

	"backend/config"
	"backend/internal/api"
	"backend/internal/logger"
	"backend/internal/netreceiver"
	"backend/internal/netsender"
	"backend/internal/sensor"
	"backend/internal/websocket"
)

func main() {
	// Parse mode from command line
	mode := flag.String("mode", "", "Mode to run: server or client")
	serveHTTP := flag.Bool("serve-http", true, "In client mode: also serve HTTP/WS (true|false)")
	flag.Parse()
	if *mode != "server" && *mode != "client" {
		fmt.Println("Usage: go run ./cmd/main.go --mode [server|client]")
		return
	}

	// Load configuration
	cfg, err := config.Load("config.toml")
	if err != nil {
		fmt.Println("Error loading config:", err)
		return
	}

	// Setup logger
	log, err := logger.New(cfg.Logger.Dir, cfg.Logger.Prefix, cfg.Logger.MaxLines)
	if err != nil {
		fmt.Println("Error creating logger:", err)
		return
	}
	defer log.Close()

	dataCh := make(chan sensor.Data)
	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup

	// websocket hub and command channel (history size from config)
	hist := cfg.Websocket.HistorySize
	if hist <= 0 {
		hist = 100
	}
	hub := websocket.NewHub(hist)
	commandCh := make(chan map[string]string, 32)

	switch *mode {
	case "server":
		// Only server opens TCP listener
		if err := netreceiver.StartTCP(ctx, &wg, cfg.Network.Address, dataCh); err != nil {
			fmt.Println("Error starting TCP listener:", err)
			cancel()
			wg.Wait()
			return
		}

		fmt.Println("Telemetry address:", cfg.Network.Address)
		fmt.Println("HTTP address:", cfg.Network.HTTPAddr)
		// start HTTP server for API/WS in background
		if err := api.StartHTTP(ctx, &wg, cfg.Network.HTTPAddr, hub, log.Printf, commandCh); err != nil {
			fmt.Println("HTTP server error:", err)
		}
		fmt.Println("Server mode: listening for incoming telemetry...")

	case "client":
		// Only client simulates sensors
		// create an intermediate channel so we can fan-out sensor data
		sensorOut := make(chan sensor.Data)
		netsenderCh := make(chan sensor.Data, 256)
		startSimulatedClient(cfg, sensorOut, ctx)

		go func() {
			defer close(netsenderCh)
			for {
				select {
				case <-ctx.Done():
					return
				case d := <-sensorOut:
					// non-blocking send to local processor
					select {
					case dataCh <- d:
					default:
					}
					// non-blocking send to netsender buffer
					select {
					case netsenderCh <- d:
					default:
					}
				}
			}
		}()

		nsCfg := netsender.NetsenderCfg{
			DialTimeout:    time.Duration(cfg.Netsender.DialTimeoutMS) * time.Millisecond,
			WriteTimeout:   time.Duration(cfg.Netsender.WriteTimeoutMS) * time.Millisecond,
			InitialBackoff: time.Duration(cfg.Netsender.InitialBackoffMS) * time.Millisecond,
			MaxBackoff:     time.Duration(cfg.Netsender.MaxBackoffMS) * time.Millisecond,
		}

		logf := func(format string, v ...interface{}) {
			log.Printf(format, v...)
		}
		if err := netsender.StartSender(ctx, &wg, cfg.Network.Address, nsCfg, netsenderCh, logf); err != nil {
			fmt.Println("netsender error:", err)
		}

		if *serveHTTP {
			if err := api.StartHTTP(ctx, &wg, cfg.Network.HTTPAddr, hub, log.Printf, commandCh); err != nil {
				fmt.Println("HTTP server error:", err)
			}
			fmt.Println("Client mode: generating telemetry and serving HTTP/WS...")
		} else {
			fmt.Println("Client mode: generating telemetry (HTTP server disabled)")
		}
	}

	// per-sensor batches: collect values per sensor name and compute stats independently
	batches := make(map[string][]float64)
	paused := false
	batchSize := cfg.Processor.BatchSize
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case d := <-dataCh:
			if paused {
				// ignore data while paused
				continue
			}
			arr := batches[d.Name]
			arr = append(arr, d.Value)
			if len(arr) >= batchSize {
				stats := sensor.Process(arr)
				log.Printf("%s stats [%s] -> Mean: %.2f, Min: %.2f, Max: %.2f",
					d.Name, d.Unit, stats.Mean, stats.Min, stats.Max)
				// broadcast telemetry summary to websocket clients
				payload := map[string]interface{}{
					"timestamp": d.Timestamp.Format(time.RFC3339),
					"sensor":    d.Name,
					"unit":      d.Unit,
					"mean":      stats.Mean,
					"min":       stats.Min,
					"max":       stats.Max,
				}
				hub.BroadcastEnvelope("telemetry", payload)
				// reset the batch slice for this sensor
				arr = arr[:0]
			}
			batches[d.Name] = arr
		case cmd := <-commandCh:

			log.Printf("command received: %v", cmd)
			// simple command execution
			action := cmd["action"]
			status := "ok"
			switch action {
			case "launch":

				log.Printf("executing launch action")
			case "pause":
				paused = true
				log.Printf("processing paused")
			case "resume":
				paused = false
				log.Printf("processing resumed")
			case "set_batch_size":
				if v, ok := cmd["value"]; ok {
					// try parse int
					var n int
					if _, err := fmt.Sscanf(v, "%d", &n); err == nil && n > 0 {
						batchSize = n
						log.Printf("batch size set to %d", n)
					} else {
						status = "invalid_value"
					}
				} else {
					status = "missing_value"
				}
			case "snapshot":
				//current state
				snap := map[string]interface{}{
					"paused":    paused,
					"batchSize": batchSize,
				}
				hub.BroadcastEnvelope("snapshot", snap)
			default:
				status = "unknown_command"
			}
			// broadcast ack/status to websocket clients (with timestamp and id)
			ack := map[string]interface{}{
				"id":      uuid.New().String(),
				"command": cmd,
				"status":  status,
			}
			hub.BroadcastEnvelope("command_ack", ack)
		case <-sigCh:
			fmt.Println("Shutting down ...")
			cancel()
			wg.Wait()
			return
		}
	}
}

func startSimulatedClient(cfg *config.Config, out chan<- sensor.Data, ctx context.Context) {
	tempGen := sensor.Generator{
		Name:   cfg.Sensor.Temperature.Name,
		Unit:   cfg.Sensor.Temperature.Unit,
		Min:    cfg.Sensor.Temperature.Min,
		Max:    cfg.Sensor.Temperature.Max,
		Period: cfg.Sensor.Temperature.Period(),
	}
	pressGen := sensor.Generator{
		Name:   cfg.Sensor.Pressure.Name,
		Unit:   cfg.Sensor.Pressure.Unit,
		Min:    cfg.Sensor.Pressure.Min,
		Max:    cfg.Sensor.Pressure.Max,
		Period: cfg.Sensor.Pressure.Period(),
	}
	cell1 := sensor.Generator{
		Name:   cfg.Sensor.Cell1.Name,
		Unit:   cfg.Sensor.Cell1.Unit,
		Min:    cfg.Sensor.Cell1.Min,
		Max:    cfg.Sensor.Cell1.Max,
		Period: cfg.Sensor.Cell1.Period(),
	}
	cell2 := sensor.Generator{
		Name:   cfg.Sensor.Cell2.Name,
		Unit:   cfg.Sensor.Cell2.Unit,
		Min:    cfg.Sensor.Cell2.Min,
		Max:    cfg.Sensor.Cell2.Max,
		Period: cfg.Sensor.Cell2.Period(),
	}
	cell3 := sensor.Generator{
		Name:   cfg.Sensor.Cell3.Name,
		Unit:   cfg.Sensor.Cell3.Unit,
		Min:    cfg.Sensor.Cell3.Min,
		Max:    cfg.Sensor.Cell3.Max,
		Period: cfg.Sensor.Cell3.Period(),
	}
	cell4 := sensor.Generator{
		Name:   cfg.Sensor.Cell4.Name,
		Unit:   cfg.Sensor.Cell4.Unit,
		Min:    cfg.Sensor.Cell4.Min,
		Max:    cfg.Sensor.Cell4.Max,
		Period: cfg.Sensor.Cell4.Period(),
	}
	cell5 := sensor.Generator{
		Name:   cfg.Sensor.Cell5.Name,
		Unit:   cfg.Sensor.Cell5.Unit,
		Min:    cfg.Sensor.Cell5.Min,
		Max:    cfg.Sensor.Cell5.Max,
		Period: cfg.Sensor.Cell5.Period(),
	}
	cell6 := sensor.Generator{
		Name:   cfg.Sensor.Cell6.Name,
		Unit:   cfg.Sensor.Cell6.Unit,
		Min:    cfg.Sensor.Cell6.Min,
		Max:    cfg.Sensor.Cell6.Max,
		Period: cfg.Sensor.Cell6.Period(),
	}
	tempGen.Start(ctx, out)
	pressGen.Start(ctx, out)
	cell1.Start(ctx, out)
	cell2.Start(ctx, out)
	cell3.Start(ctx, out)
	cell4.Start(ctx, out)
	cell5.Start(ctx, out)
	cell6.Start(ctx, out)
}
