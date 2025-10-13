package model

import "time"

/*
ResultData represents statistics for a batch of SensorData,
containing average, minimum, and maximum values for both speed, temperature and pressure
and indemnifications such as its ID and the time it was generated and processed.
*/
type ResultData struct {
	AverageSpeed    float32
	MinSpeed        float32
	MaxSpeed        float32
	AverageTemp     float32
	MinTemp         float32
	MaxTemp         float32
	AveragePressure float32
	MinPressure     float32
	MaxPressure     float32
	VehicleID       string
	CreatedAt     time.Time
	ProcessedAt     time.Time
}
