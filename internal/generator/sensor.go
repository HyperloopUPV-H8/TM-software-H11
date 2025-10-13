package generator

import (
	"math/rand"
	"strings"
	"time"

	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

/*
Sensor simulates a sensor by generating random speed, pressure and temperature
readings every sensorInterval and sending them to the provided channel.

Speed behavior responds to control commands:
- "Start" → enables movement.
- "Stop" → sets speed to 0.
- "Accelerate n" → increases current speed by n.
- "Mode" → changes driving mode (eco|normal|speed).
*/
func Sensor(inCommandChan <-chan model.Command, outChan chan<- model.SensorData) {
	sensorInterval := config.Sensor.Interval // defines how often a new sensor reading is generated.

	ticker := time.NewTicker(sensorInterval)
	defer ticker.Stop()

	minS, maxS := config.Sensor.MinSpeed, config.Sensor.MaxSpeed
	minP, maxP := config.Sensor.MinPressure, config.Sensor.MaxPressure
	minT, maxT := config.Sensor.MinTemp, config.Sensor.MaxTemp

	// vehicle state
	currentSpeed := float32(0)
	mode := "normal"
	started := false

	for {
		select {
			case cmd := <- inCommandChan:
				switch strings.ToLower(cmd.Action) {
					case "start":
						started = true
					case "stop":
						started = false
						currentSpeed = 0
					case "accelerate":
						// Try to read numeric parameter
						if val, ok := cmd.Params.(float64); ok {
							currentSpeed += float32(val)
						}
					case "mode":
						if val, ok := cmd.Params.(string); ok {
							mode = strings.ToLower(val)
						}
				}
			
			case <- ticker.C:
				// adjust max speed depending on mode
				var maxAllowed float32
				switch mode {
					case "eco":
						maxAllowed = maxS * 0.5
					case "normal":
						maxAllowed = maxS * 0.8
					case "speed":
						maxAllowed = maxS
					default:
						maxAllowed = maxS * 0.8
				}

				// simulate speed
				if started {
					if currentSpeed < minS {
						currentSpeed = minS
					}
					if currentSpeed > maxAllowed {
						currentSpeed = maxAllowed
					}
				} else {
					currentSpeed = 0
				}

				data := model.SensorData{
					VehicleID:   config.Vehicle.VehicleID,
					Speed:    	 currentSpeed,
					Pressure:    rand.Float32()*(maxP-minP) + minP, // 0-10 bar
					Temperature: rand.Float32()*(maxT-minT) + minT, // 0-50 °C
					CreatedAt: time.Now().Local(),
				}
				outChan <- data
		}
	} 	
}