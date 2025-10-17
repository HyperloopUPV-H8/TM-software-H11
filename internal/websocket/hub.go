package websocket

import (
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

// Hub manages websocket clients, broadcasting messages and keeping a history
type Hub struct {
	// registered clients
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte

	clients map[*Client]bool

	// history of last messages
	history [][]byte
	capHist int

	// internal control
	mu  sync.RWMutex
	seq uint64
}

// Envelope is the standard message wrapper sent to clients.
type Envelope struct {
	Type      string          `json:"type"`
	Timestamp string          `json:"ts"`
	Seq       uint64          `json:"seq,omitempty"`
	Payload   json.RawMessage `json:"payload"`
}

// BroadcastEnvelope marshals the payload and sends a standardized envelope.
func (h *Hub) BroadcastEnvelope(typ string, payload interface{}) {
	p, err := json.Marshal(payload)
	if err != nil {
		return
	}
	env := Envelope{
		Type:      typ,
		Timestamp: time.Now().Format(time.RFC3339),
		Seq:       atomic.AddUint64(&h.seq, 1),
		Payload:   json.RawMessage(p),
	}
	b, err := json.Marshal(env)
	if err != nil {
		return
	}

	fmt.Printf("%s hub: BroadcastEnvelope type=%s seq=%d payload_len=%d\n", time.Now().Format(time.RFC3339), env.Type, env.Seq, len(env.Payload))
	h.Broadcast(b)
}

// NewHub creates a Hub with history capacity n
func NewHub(historyCap int) *Hub {
	h := &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte, 256),
		clients:    make(map[*Client]bool),
		history:    make([][]byte, 0, historyCap),
		capHist:    historyCap,
	}
	go h.run()
	return h
}

func (h *Hub) Broadcast(msg []byte) {

	h.appendHistory(msg)

	select {
	case h.broadcast <- msg:
	default:
		// drop if full to avoid blocking producer
	}
}

// returns a copy of the stored history (most recent first)
func (h *Hub) LastMessages() [][]byte {
	h.mu.RLock()
	defer h.mu.RUnlock()
	fmt.Printf("%s hub: LastMessages called, history_len=%d\n", time.Now().Format(time.RFC3339), len(h.history))
	out := make([][]byte, len(h.history))
	for i := range h.history {
		out[i] = make([]byte, len(h.history[i]))
		copy(out[i], h.history[i])
	}
	return out
}

func (h *Hub) run() {
	for {
		select {
		case msg := <-h.broadcast:
			// forward to clients (non-blocking per client)

			sent := 0
			for c := range h.clients {
				select {
				case c.send <- msg:
					sent++
				default:
					// if client's send buffer full, drop message for that client
				}
			}
			if sent == 0 {
				fmt.Printf("%s hub: broadcasted message but no clients received it (clients=%d)\n", time.Now().Format(time.RFC3339), len(h.clients))
			} else {
				fmt.Printf("%s hub: broadcasted message to %d clients\n", time.Now().Format(time.RFC3339), sent)
			}
		case c := <-h.register:
			h.clients[c] = true
			fmt.Printf("%s hub: client registered (id=%p) clients=%d\n", time.Now().Format(time.RFC3339), c, len(h.clients))
		case c := <-h.unregister:
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
				fmt.Printf("%s hub: client unregistered (id=%p) clients=%d\n", time.Now().Format(time.RFC3339), c, len(h.clients))
			}
		}
	}
}

func (h *Hub) appendHistory(msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	m := make([]byte, len(msg))
	copy(m, msg)
	if h.capHist <= 0 {
		return
	}
	if len(h.history) < h.capHist {

		h.history = append([][]byte{m}, h.history...)
		fmt.Printf("%s hub: appendHistory now len=%d\n", time.Now().Format(time.RFC3339), len(h.history))
		return
	}

	h.history = append([][]byte{m}, h.history[:h.capHist-1]...)
	fmt.Printf("%s hub: appendHistory rotated len=%d\n", time.Now().Format(time.RFC3339), len(h.history))
}
