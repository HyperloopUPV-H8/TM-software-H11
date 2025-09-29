package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"backend/config"
	"backend/internal/logger"
	"backend/internal/sensor"
)

func main() {
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

	// Start sensors
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

	tempGen.Start(dataCh, stopCh)
	pressGen.Start(dataCh, stopCh)

	// Batch and process data
	var batch []float64
	forward := func(values []float64, name string, unit string) {
		stats := sensor.Process(values)
		log.Printf("%s stats [%s] -> Mean: %.2f, Min: %.2f, Max: %.2f",
			name, unit, stats.Mean, stats.Min, stats.Max)
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case d := <-dataCh:
			batch = append(batch, d.Value)
			if len(batch) >= cfg.Processor.BatchSize {
				forward(batch, d.Name, d.Unit)
				batch = batch[:0]
			}
		case <-sigCh:
			close(stopCh)
			fmt.Println("Shutting down ...")
			return
		}
	}
}
