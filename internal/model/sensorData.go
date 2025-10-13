package model

import "time"

/*
SensorData represents a single sensor reading,
containing speed, pressure and temperature values
and indemnifications such as its ID and the time it was generated.
*/
type SensorData struct {
	Speed       float32
	Pressure    float32
	Temperature float32
	VehicleID   string
	CreatedAt time.Time
}
