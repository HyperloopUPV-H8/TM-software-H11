package websocket

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"

	gw "github.com/gorilla/websocket"
)

var upgrader = gw.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Client struct {
	conn *gw.Conn
	send chan []byte
	hub  *Hub
	id   uint64
}

var clientID uint64

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		// ignore client messages for now
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {

				c.conn.WriteMessage(gw.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(gw.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(gw.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// HandleWS upgrades HTTP connection to websocket and registers client
func HandleWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {

		fmt.Printf("%s handler: websocket upgrade failed from %s: %v\n", time.Now().Format(time.RFC3339), r.RemoteAddr, err)
		for k, v := range r.Header {
			fmt.Printf("%s handler: header %s=%v\n", time.Now().Format(time.RFC3339), k, v)
		}
		return
	}
	c := &Client{
		conn: conn,
		send: make(chan []byte, 256),
		hub:  hub,
		id:   atomic.AddUint64(&clientID, 1),
	}

	fmt.Printf("%s handler: new WS client connected (id=%p)\n", time.Now().Format(time.RFC3339), c)
	hub.register <- c

	for _, m := range hub.LastMessages() {
		select {
		case c.send <- m:
		default:
			// drop
		}
	}

	go c.writePump()
	c.readPump()
}

// processes POST /api/commands
func HandleCommands(logf func(string, ...interface{}), commandCh chan<- map[string]string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var cmd map[string]string
		dec := json.NewDecoder(r.Body)
		if err := dec.Decode(&cmd); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}
		// log command
		if logf != nil {
			logf("command received: %v", cmd)
		}

		select {
		case commandCh <- cmd:
		default:

			http.Error(w, "command queue full", http.StatusServiceUnavailable)
			return
		}
		// ack
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "queued"})
	}
}

// GET /api/messages returning the hub history
func HandleMessages(hub *Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		msgs := hub.LastMessages()

		out := make([]json.RawMessage, len(msgs))
		for i, m := range msgs {
			out[i] = json.RawMessage(m)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(out)
	}
}
