package sensor

import (
	"context"
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
// It stops when ctx is canceled.
func (g Generator) Start(ctx context.Context, out chan<- Data) {
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
			case <-ctx.Done():
				return
			}
		}
	}()
}
