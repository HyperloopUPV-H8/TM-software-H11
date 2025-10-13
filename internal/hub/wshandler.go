package hub

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// CreateConnWS upgrades an HTTP connection to a WebSocket and returns the connection object.
func CreateConnWS(w http.ResponseWriter, r *http.Request) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return nil
	}
	return conn
}

/*
ListenCommandWS listens for a command from the WebSocket
parses it to a Go struct
and forwards it to a channel.
*/
func ReceiveCommandFromFrontEnd(conn *websocket.Conn, outChan1 chan<- model.Command, outChan2 chan<- model.Command) {
	defer conn.Close()
	
	for {
		// Listen for WS Command JSON
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading WS command:", err)
			break
		}

		// Parse it to Command struct
		var cmd model.Command
		if err := json.Unmarshal(msg, &cmd); err != nil {
			log.Println("Error parsing WS command JSON:", err)
			continue
		}

		// Sends it to channel
		outChan1 <- cmd
		outChan2 <- cmd
	}
}

/*
SendResultToFrontEnd receives ResultData from a channel, 
marshals it to JSON-encoded []byte 
and sends it via WS to the WebSocket client.
*/
func SendResultToFrontEnd(conn *websocket.Conn, inChan <-chan model.ResultData) {
	// Receive ResultData from channel
	for result := range inChan {
		// Marshal ResultData to JSON-encoded []byte
		data, err := json.Marshal(result)
		if err != nil {
			log.Println("Error marshalling WS result JSON:", err)
			continue
		}

		// Send JSON via WS
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error sending via WS:", err)
			break
		}
	}
}
