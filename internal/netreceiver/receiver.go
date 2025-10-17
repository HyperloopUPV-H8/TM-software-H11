package netreceiver

import (
	"backend/internal/sensor"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"sync"
	"time"
)

type Telemetry struct {
	Name      string  `json:"name"`
	Value     float64 `json:"value"`
	Unit      string  `json:"unit"`
	Timestamp string  `json:"timestamp"`
}

// StartTCP starts a tcp listener that decodes incoming JSON messages into sensor Data.
// It returns immediately and runs the listener in background. Cancel the provided ctx to stop.
func StartTCP(ctx context.Context, wg *sync.WaitGroup, address string, out chan<- sensor.Data) error {
	ln, err := net.Listen("tcp", address)
	if err != nil {
		return fmt.Errorf("listen error: %w", err)
	}
	fmt.Println("Listening on", address)
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer ln.Close()
		for {

			conn, err := ln.Accept()
			if err != nil {
				select {
				case <-ctx.Done():
					return
				default:
				}
				// temporary error
				continue
			}
			go handleConn(conn, out)
		}
	}()
	return nil
}

func handleConn(conn net.Conn, out chan<- sensor.Data) {
	defer conn.Close()
	dec := json.NewDecoder(conn)
	for {
		var t Telemetry
		if err := dec.Decode(&t); err != nil {
			if err == io.EOF {
				return
			}
			fmt.Println("decode error:", err)
			return
		}
		out <- sensor.Data{
			Name:      t.Name,
			Value:     t.Value,
			Unit:      t.Unit,
			Timestamp: parseTime(t.Timestamp),
		}
	}
}

func parseTime(s string) time.Time {
	t, _ := time.Parse(time.RFC3339, s)
	return t
}
