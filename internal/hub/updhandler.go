package hub

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

// CreateConnUDP establishes a UDP connection to the configured address and port.
func CreateConnUDP() *net.UDPConn {
	// Client address
	clientAddr := net.UDPAddr{
		IP:   net.ParseIP("127.0.0.1"),
		Port: config.Hub.UDPPort,
	}
	conn, err := net.DialUDP("udp", nil, &clientAddr)
	if err != nil {
		fmt.Println("Error connecting via UDP", err)
		panic(err)
	}
	return conn
}

/*
SendResultToConsumer receives ResultData from a channel,
marshals it to JSON-encoded []byte
and sends it via UDP to a localhost client.
*/
func SendResultToConsumer(conn *net.UDPConn, inChan <-chan model.ResultData) {
	defer conn.Close()
	
	// Receive ResultData from channel
	for resultData := range inChan {
		// Marshal ResultData to JSON-encoded []byte
		data, err := json.Marshal(resultData)
		if err != nil {
			fmt.Println("Error marshalling WS result JSON", err)
			continue
		}

		// Send JSON via UDP
		_, err = conn.Write(data)
		if err != nil {
			fmt.Println("Error sending via UDP:", err)
			continue
		}
	}
}
