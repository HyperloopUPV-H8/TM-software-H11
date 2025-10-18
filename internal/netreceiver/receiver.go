package netreceiver

import (
	"backend/internal/sensor"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"time"
)

type Telemetry struct {
	Name      string  `json:"name"`
	Value     float64 `json:"value"`
	Unit      string  `json:"unit"`
	Timestamp string  `json:"timestamp"`
}

// starts a tpc listener that decodes incoming JSON messages into sensor Data
func StartTCP(address string, out chan<- sensor.Data, stop <-chan struct{}) error {
	ln, err := net.Listen("tcp", address)
	if err != nil {
		return fmt.Errorf("listen error: %w", err)
	}
	fmt.Println("Listening on", address)
	go func() {
		defer ln.Close()
		for {
			conn, err := ln.Accept()
			if err != nil {
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
