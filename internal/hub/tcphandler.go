package hub

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

// CreateConnTCP establishes a TCP connection to the configured address and port.
func CreateConnTCP() net.Conn {
	address := fmt.Sprintf("127.0.0.1:%d", config.Hub.TCPPort)
	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Error connecting via TCP:", err)
		panic(err)
	}
	return conn
}

/*
SendCommandToConsumer receives Command data from a channel,
marshals it to JSON-encoded []byte
and sends it via TCP to a localhost consumer.
*/
func SendCommandToConsumer(conn net.Conn, inChan <-chan model.Command) {
	defer conn.Close()
	
	// Receive Command from channel
	for command := range inChan {
		// Marshal ResultData to JSON-encoded []byte
		data, err := json.Marshal(command)
		if err != nil {
			fmt.Println("Error marshalling WS command JSON:", err)
			continue
		}

		// Append newline for message delimiting
		data = append(data, '\n')

		// Send JSON via TCP
		_, err = conn.Write(data)
		if err != nil {
			fmt.Println("Error sending via TCP:", err)
			break
		}
	}
}
