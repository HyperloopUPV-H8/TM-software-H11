package websocket

import (
	"testing"
	"time"
)

// simple test
func TestHubHistoryAppend(t *testing.T) {
	h := NewHub(3)

	h.Broadcast([]byte("one"))
	h.Broadcast([]byte("two"))
	h.Broadcast([]byte("three"))

	// give hub goroutine a moment to process
	time.Sleep(10 * time.Millisecond)

	msgs := h.LastMessages()
	if len(msgs) != 3 {
		t.Fatalf("expected 3 messages, got %d", len(msgs))
	}
	if string(msgs[0]) != "three" {
		t.Errorf("expected most recent 'three', got '%s'", string(msgs[0]))
	}
	if string(msgs[2]) != "one" {
		t.Errorf("expected oldest 'one', got '%s'", string(msgs[2]))
	}
}

func TestHubHistoryRotation(t *testing.T) {
	h := NewHub(2)
	h.Broadcast([]byte("a"))
	h.Broadcast([]byte("b"))
	h.Broadcast([]byte("c"))
	time.Sleep(10 * time.Millisecond)
	msgs := h.LastMessages()
	if len(msgs) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(msgs))
	}
	if string(msgs[0]) != "c" || string(msgs[1]) != "b" {
		t.Fatalf("unexpected rotation: %+v", msgs)
	}
}

func TestBroadcastNonBlocking(t *testing.T) {
	h := NewHub(1)
	// fill the broadcast channel by sending many messages quickly
	for i := 0; i < 1000; i++ {
		h.Broadcast([]byte("x"))
	}
	// if Broadcast blocked, test would hang; reach here means non-blocking
}
