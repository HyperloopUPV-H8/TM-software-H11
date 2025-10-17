package netsender

import (
	"backend/internal/sensor"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
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

type NetsenderCfg struct {
	DialTimeout    time.Duration
	WriteTimeout   time.Duration
	InitialBackoff time.Duration
	MaxBackoff     time.Duration
}

// StartSender connects to address and sends telemetry JSON messages from in channel.
// It reconnects if the connection is lost. Stops when stop is closed..
func StartSender(ctx context.Context, wg *sync.WaitGroup, address string, cfg NetsenderCfg, in <-chan sensor.Data, logf func(string, ...interface{})) error {
	wg.Add(1)
	go func() {
		defer wg.Done()
		var conn net.Conn
		var err error
		backoff := cfg.InitialBackoff
		if backoff <= 0 {
			backoff = 1 * time.Second
		}
		maxBackoff := cfg.MaxBackoff
		if maxBackoff <= 0 {
			maxBackoff = 30 * time.Second
		}
		// use math/rand for jitter
		r := rand.New(rand.NewSource(time.Now().UnixNano()))

		for {
			select {
			case <-ctx.Done():
				if conn != nil {
					conn.Close()
				}
				return
			default:
			}

			if conn == nil {
				dialer := net.Dialer{Timeout: cfg.DialTimeout}
				if dialer.Timeout == 0 {
					dialer.Timeout = 3 * time.Second
				}
				conn, err = dialer.Dial("tcp", address)
				if err != nil {
					if logf != nil {
						logf("%s netsender: dial error: %v", time.Now().Format(time.RFC3339), err)
					} else {
						fmt.Printf("%s netsender: dial error: %v\n", time.Now().Format(time.RFC3339), err)
					}
					// backoff with jitter
					jitter := time.Duration(r.Int63n(500)) * time.Millisecond
					if r.Intn(2) == 0 {
						jitter = -jitter
					}
					wait := backoff + jitter
					if wait < 0 {
						wait = backoff
					}
					select {
					case <-ctx.Done():
						return
					case <-time.After(wait):
					}
					backoff *= 2
					if backoff > maxBackoff {
						backoff = maxBackoff
					}
					continue
				}
				// reset backoff if connected=true
				backoff = cfg.InitialBackoff
				if backoff <= 0 {
					backoff = 1 * time.Second
				}
				if logf != nil {
					logf("%s netsender: connected to %s", time.Now().Format(time.RFC3339), address)
				} else {
					fmt.Printf("%s netsender: connected to %s\n", time.Now().Format(time.RFC3339), address)
				}
			}

			select {
			case <-ctx.Done():
				if conn != nil {
					conn.Close()
				}
				return
			case d := <-in:
				t := Telemetry{
					Name:      d.Name,
					Value:     d.Value,
					Unit:      d.Unit,
					Timestamp: d.Timestamp.Format(time.RFC3339),
				}
				if b, err := json.Marshal(t); err == nil {
					b = append(b, '\n')
					// set write deadline
					wt := cfg.WriteTimeout
					if wt <= 0 {
						wt = 5 * time.Second
					}
					_ = conn.SetWriteDeadline(time.Now().Add(wt))
					if _, err := conn.Write(b); err != nil {
						// close conn and attempt reconnect
						if logf != nil {
							logf("%s netsender: write error: %v", time.Now().Format(time.RFC3339), err)
						} else {
							fmt.Printf("%s netsender: write error: %v\n", time.Now().Format(time.RFC3339), err)
						}
						conn.Close()
						conn = nil
					}
				}
			}
		}
	}()
	return nil
}
