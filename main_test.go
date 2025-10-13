package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/vasyl-ks/TM-software-H11/config"
)

func TestFrontendSimulation(t *testing.T) {
	_, cancel := context.WithCancel(context.Background())
    t.Cleanup(cancel)

	// Start main
	go Start()

	// Check directory
	err := os.MkdirAll("test", 0755)
	if err != nil {
		fmt.Println("Error creating directory:", err)
		return
	}

	// Setup logging
	logFile, err := os.Create("test/test_logs.jsonl")
	if err != nil {
		t.Fatalf("failed to create log file: %v", err)
	}
	defer logFile.Close()
	logger := log.New(logFile, "", log.LstdFlags)

	// Connect to running Hub
	wsURL := fmt.Sprintf("ws://localhost:%d/api/stream", config.Hub.WSPort)
	dialer := websocket.Dialer{HandshakeTimeout: 3 * time.Second}

	conn, resp, err := dialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("failed to connect to Hub WebSocket: %v", err)
	}
	defer conn.Close()
	defer resp.Body.Close()
	logger.Printf("[INFO] Connected to Hub, status=%d\n", resp.StatusCode)

	// Command sequence
	commands := []map[string]interface{}{
		{"action": "mode", "params": "normal"},
		{"action": "start"},
		{"action": "stop"},
		{"action": "accelerate", "params": 5},
		{"action": "start"},
		{"action": "accelerate", "params": 130},
		{"action": "accelerate", "params": -10},
		{"action": "mode", "params": "speed"},
		{"action": "accelerate"},
		{"action": "accelerate", "params": 40},
		{"action": "mode", "params": "eco"},
		{"action": "stop"},
	}

	// Reader goroutine: log all incoming messages
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				logger.Printf("[INFO] Read loop ended: %v\n", err)
				return
			}
			logger.Printf("[RESULT] %s\n", strings.TrimSpace(string(msg)))
		}
	}()

	// Send commands with 1 s delay between each
	for i, cmd := range commands {
		if err := conn.WriteJSON(cmd); err != nil {
			t.Fatalf("failed to send command %d (%v): %v", i, cmd, err)
		}
		logger.Printf("[SENT] %+v\n", cmd)
		time.Sleep(1 * time.Second)
	}

	// Graceful close
	closeFrame := websocket.FormatCloseMessage(websocket.CloseNormalClosure, "")
	if err := conn.WriteControl(websocket.CloseMessage, closeFrame, time.Now().Add(time.Second)); err != nil {
		logger.Printf("[WARN] Failed to send close frame: %v\n", err)
	}

	<-done
	logger.Println("[INFO] Frontend simulation finished.")
}
