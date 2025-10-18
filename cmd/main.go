package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"backend/config"
	"backend/internal/logger"
	"backend/internal/netreceiver"
	"backend/internal/sensor"
)

func main() {
	// Parse mode from command line
	mode := flag.String("mode", "", "Mode to run: server or client")
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
	stopCh := make(chan struct{})

	switch *mode {
	case "server":
		// Only server opens TCP listener
		if err := netreceiver.StartTCP(cfg.Network.Address, dataCh, stopCh); err != nil {
			fmt.Println("Error starting TCP listener:", err)
			return
		}
		fmt.Println("Server mode: listening for incoming telemetry...")

	case "client":
		// Only client simulates sensors
		startSimulatedClient(cfg, dataCh, stopCh)
		fmt.Println("Client mode: generating and sending telemetry...")
	}

	batch := make([]float64, 0, cfg.Processor.BatchSize)
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case d := <-dataCh:
			batch = append(batch, d.Value)
			if len(batch) >= cfg.Processor.BatchSize {
				stats := sensor.Process(batch)
				log.Printf("%s stats [%s] -> Mean: %.2f, Min: %.2f, Max: %.2f",
					d.Name, d.Unit, stats.Mean, stats.Min, stats.Max)
				batch = batch[:0]
			}
		case <-sigCh:
			close(stopCh)
			fmt.Println("Shutting down ...")
			return
		}
	}
}

func startSimulatedClient(cfg *config.Config, out chan<- sensor.Data, stop <-chan struct{}) {
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
	tempGen.Start(out, stop)
	pressGen.Start(out, stop)
}
