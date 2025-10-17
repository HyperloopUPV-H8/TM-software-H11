package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	gw "github.com/gorilla/websocket"

	"backend/internal/websocket"
)

func TestWebSocketCommandAck(t *testing.T) {

	hub := websocket.NewHub(10)
	commandCh := make(chan map[string]string, 4)

	// Instead of trying to reuse StartHTTP (which starts its own listener), create the mux
	mux := http.NewServeMux()
	fs := http.FileServer(http.Dir("./web"))
	mux.Handle("/", fs)
	mux.HandleFunc("/api/stream", func(w http.ResponseWriter, r *http.Request) { websocket.HandleWS(hub, w, r) })
	mux.HandleFunc("/api/commands", websocket.HandleCommands(nil, commandCh))
	mux.HandleFunc("/api/messages", websocket.HandleMessages(hub))
	ts := httptest.NewServer(mux)
	defer ts.Close()

	go func() {
		for cmd := range commandCh {

			hub.BroadcastEnvelope("command_ack", map[string]string{"status": "ok", "action": cmd["action"]})

			hub.BroadcastEnvelope("snapshot", map[string]string{"note": "snapshot after command"})
		}
	}()

	// connect a websocket client

	u := ts.URL + "/api/stream"
	if strings.HasPrefix(ts.URL, "https://") {
		u = "wss" + strings.TrimPrefix(u, "https")
	} else {
		u = "ws" + strings.TrimPrefix(u, "http")
	}
	dialer := gw.DefaultDialer
	c, resp, err := dialer.Dial(u, nil)
	if err != nil {
		if resp != nil {
			t.Fatalf("dial error: %v status=%s", err, resp.Status)
		} else {
			t.Fatalf("dial error: %v", err)
		}
	}
	defer c.Close()

	cmd := map[string]string{"action": "snapshot"}
	b, _ := json.Marshal(cmd)
	res, err := http.Post(ts.URL+"/api/commands", "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("post error: %v", err)
	}
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("expected 202 Accepted, got %d", res.StatusCode)
	}

	// wait and check that websocket receives an ack or snapshot
	c.SetReadDeadline(time.Now().Add(5 * time.Second))
	_, msg, err := c.ReadMessage()
	if err != nil {
		t.Fatalf("read message error: %v", err)
	}
	var env map[string]interface{}
	if err := json.Unmarshal(msg, &env); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if env["type"] != "command_ack" && env["type"] != "snapshot" {
		t.Fatalf("expected command_ack or snapshot, got %v", env["type"])
	}

}
