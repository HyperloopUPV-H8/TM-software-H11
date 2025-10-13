package generator

import (
	"time"

	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

// getLastTime returns the latest timestamp from a slice of SensorData.
func getLastTime(data []model.SensorData) time.Time {
	maxTime := data[0].CreatedAt
	for _, d := range data[1:] {
		if d.CreatedAt.After(maxTime) {
			maxTime = d.CreatedAt
		}
	}
	return maxTime
}

// calculateAverage returns average values from a slice of SensorData.
func calculateAverage(data []model.SensorData) model.ResultData {
	var sumSpeed, sumTemp, sumPressure float32
	n := float32(len(data))

	for _, d := range data {
		sumSpeed += d.Speed
		sumTemp += d.Temperature
		sumPressure += d.Pressure
	}

	return model.ResultData{
		AverageSpeed:    sumSpeed / n,
		AverageTemp:     sumTemp / n,
		AveragePressure: sumPressure / n,
	}
}

// calculateMin returns minimum values from a slice of SensorData.
func calculateMin(data []model.SensorData) model.ResultData {
	minSpeed := data[0].Speed
	minTemp := data[0].Temperature
	minPressure := data[0].Pressure

	for _, d := range data[1:] {
		if d.Speed < minSpeed {
			minSpeed = d.Speed
		}
		if d.Temperature < minTemp {
			minTemp = d.Temperature
		}
		if d.Pressure < minPressure {
			minPressure = d.Pressure
		}
	}

	return model.ResultData{
		MinSpeed:    minSpeed,
		MinTemp:     minTemp,
		MinPressure: minPressure,
	}
}

// calculateMax returns maximum values from a slice of SensorData.
func calculateMax(data []model.SensorData) model.ResultData {
	maxSpeed := data[0].Speed
	maxTemp := data[0].Temperature
	maxPressure := data[0].Pressure

	for _, d := range data[1:] {
		if d.Speed > maxSpeed {
			maxSpeed = d.Speed
		}
		if d.Temperature > maxTemp {
			maxTemp = d.Temperature
		}
		if d.Pressure > maxPressure {
			maxPressure = d.Pressure
		}
	}

	return model.ResultData{
		MaxSpeed:    maxSpeed,
		MaxTemp:     maxTemp,
		MaxPressure: maxPressure,
	}
}

/*
Process collects SensorData values from the input channel into a slice.
Every batchInterval, it calculates statistics (average, min, max) using
separate goroutines (fan-out/fan-in pattern), builds a Result, and sends it to the output channel.

Note:
  - The slice is cleared after each batch, so results are not cumulative.
  - Calculations are split into separate functions/goroutines for concurrency practice,
    even though a single-pass calculation would be faster and use less computational overhead.
*/
func Process(inChan <-chan model.SensorData, outChan chan<- model.ResultData) {
	batchInterval := config.Processor.Interval // defines how often results are calculated.

	var dataSlice []model.SensorData
	ticker := time.NewTicker(batchInterval)
	defer ticker.Stop()

	for {
		select {
		case data := <-inChan:
			dataSlice = append(dataSlice, data)
		case <-ticker.C:
			// Channels for calculations
			tmeChan := make(chan time.Time)
			avgChan := make(chan model.ResultData)
			minChan := make(chan model.ResultData)
			maxChan := make(chan model.ResultData)

			// Goroutines for calculations
			go func() { tmeChan <- getLastTime(dataSlice) }()
			go func() { avgChan <- calculateAverage(dataSlice) }()
			go func() { minChan <- calculateMin(dataSlice) }()
			go func() { maxChan <- calculateMax(dataSlice) }()

			// Wait for results
			tme := <-tmeChan
			avg := <-avgChan
			min := <-minChan
			max := <-maxChan

			// Build ResultData
			result := model.ResultData{
				AverageSpeed:    avg.AverageSpeed,
				MinSpeed:        min.MinSpeed,
				MaxSpeed:        max.MaxSpeed,
				AverageTemp:     avg.AverageTemp,
				MinTemp:         min.MinTemp,
				MaxTemp:         max.MaxTemp,
				AveragePressure: avg.AveragePressure,
				MinPressure:     min.MinPressure,
				MaxPressure:     max.MaxPressure,
				VehicleID:       dataSlice[0].VehicleID,
				CreatedAt:       tme,
				ProcessedAt:     time.Now().Local(),
			}
			outChan <- result

			// Reset slice for next batch
			dataSlice = []model.SensorData{}
		}
	}
}
