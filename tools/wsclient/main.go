package main

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"backend/config"
	gw "github.com/gorilla/websocket"
)

func main() {
	// Load configuration
	cfg, err := config.Load("config.toml")
	if err != nil {
		log.Fatal("Error loading config:", err)
	}
	
	u := url.URL{Scheme: "ws", Host: cfg.Network.HTTPAddr, Path: "/api/stream"}
	log.Printf("connecting to %s", u.String())
	dialer := gw.DefaultDialer
	c, resp, err := dialer.Dial(u.String(), nil)
	if err != nil {
		if resp != nil {
			fmt.Fprintf(os.Stderr, "dial error: %v, status: %s\n", err, resp.Status)
		} else {
			fmt.Fprintf(os.Stderr, "dial error: %v\n", err)
		}
		os.Exit(1)
	}
	defer c.Close()

	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Printf("read error: %v", err)
				return
			}
			log.Printf("recv: %s", string(message))
		}
	}()

	// keep alive for a while to observe traffic
	t := time.NewTimer(30 * time.Second)
	select {
	case <-t.C:
		log.Println("timeout, closing")
	case <-done:
		log.Println("connection closed by server")
	}
}
