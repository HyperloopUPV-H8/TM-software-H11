package generator

import (
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

/*
Generator initializes the dataChan channel, then calls the Sensor and Process goroutines.
- Sensor runs independently, generates random values, SensorData, and sends it through dataChan.
  - Sensor also receives Command messages via inCommandChan to modify its behavior in real time.
- Process receives SensorData, calculates statistics, builds a Result, and sends it through outResultChan.
*/
func Run(inCommandChan <-chan model.Command, outResultChan chan<- model.ResultData) {
	// Create unbuffered channel.
	dataChan := make(chan model.SensorData)

	// Launch concurrent goroutines.
	go Sensor(inCommandChan, dataChan)
	go Process(dataChan, outResultChan)
}
