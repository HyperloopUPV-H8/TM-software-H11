package netsender

import (
	"context"
	"encoding/json"
	"net"
	"sync"
	"testing"
	"time"

	"backend/internal/sensor"
)

// TestSenderReceiverIntegration creates a local listener in the test, accepts the
// connection from StartSender and decodes the JSON telemetry messages. This
// avoids racing.
func TestSenderReceiverIntegration(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0") //...
	if err != nil {
		t.Fatalf("listen failed: %v", err)
	}
	defer ln.Close()
	addr := ln.Addr().String()

	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup

	// channel to receive Telemetry decoded from the connection
	telemCh := make(chan Telemetry, 4)

	// accept connection and decode JSON messages
	go func() {
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		dec := json.NewDecoder(conn)
		for {
			var tmsg Telemetry
			if err := dec.Decode(&tmsg); err != nil {
				return
			}
			telemCh <- tmsg
		}
	}()

	// start sender (it will dial the addr above)
	nsCfg := NetsenderCfg{
		DialTimeout:    500 * time.Millisecond,
		WriteTimeout:   500 * time.Millisecond,
		InitialBackoff: 100 * time.Millisecond,
		MaxBackoff:     1 * time.Second,
	}
	in := make(chan sensor.Data, 4)
	if err := StartSender(ctx, &wg, addr, nsCfg, in, t.Logf); err != nil {
		t.Fatalf("StartSender failed: %v", err)
	}

	// send some samples
	in <- sensor.Data{Name: "T", Unit: "C", Value: 1.0, Timestamp: time.Now()}
	in <- sensor.Data{Name: "T", Unit: "C", Value: 2.0, Timestamp: time.Now()}

	select {
	case <-time.After(3 * time.Second):
		cancel()
		wg.Wait()
		t.Fatalf("timed out waiting for telemetry")
	case tm := <-telemCh:
		if tm.Name == "" {
			t.Fatalf("received empty telemetry")
		}
		// pass
		_ = tm
	}

	cancel()
	wg.Wait()
}
