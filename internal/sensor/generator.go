package sensor

import (
	"math/rand"
	"time"
)

// Data represents a single sensor reading.
type Data struct {
	Timestamp time.Time
	Value     float64
	Name      string
	Unit      string
}

// Generator simulates a sensor with configurable range and period.
type Generator struct {
	Name   string
	Unit   string
	Min    float64
	Max    float64
	Period time.Duration
}

// Start launches a goroutine that produces readings into the out channel.
// It stops when the context is canceled.
func (g Generator) Start(out chan<- Data, stop <-chan struct{}) {
	go func() {
		ticker := time.NewTicker(g.Period)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				v := g.Min + rand.Float64()*(g.Max-g.Min)
				out <- Data{
					Timestamp: time.Now(),
					Value:     v,
					Name:      g.Name,
					Unit:      g.Unit,
				}
			case <-stop:
				return
			}
		}
	}()
}
