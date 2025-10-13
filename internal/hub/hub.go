package hub

import (
	"fmt"
	"net/http"
	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

/*
Hub acts as a central bridge between the Generator, Frontend, and Consumer.
- Generator ↔ Hub: exchanges ResultData and Command via internal channels.
- Frontend ↔ Hub: exchanges Command and ResultData over WebSocket.
- Consumer ↔ Hub: sends ResultData via UDP and Command via TCP.
*/
func Run(inResultChan <-chan model.ResultData, outCommandChan chan<- model.Command) {
	// Create unbuffered channel.
	internalCommandChan := make(chan model.Command)

	// WS
	http.HandleFunc("/api/stream", func(w http.ResponseWriter, r *http.Request) {
		// Create Connection
		conn := CreateConnWS(w, r)
		if conn == nil {
			return
		}

		// Launch concurrent goroutines
		go ReceiveCommandFromFrontEnd(conn, internalCommandChan, outCommandChan)
		go SendResultToFrontEnd(conn, inResultChan)
	})
	go func() {
		http.ListenAndServe(":"+fmt.Sprintf("%d", config.Hub.WSPort), nil)
	}()

	// UDP
	{
		// Create Connection
		conn := CreateConnUDP()
		if conn == nil {
			return
		}

		// Launch concurrent goroutines
		go SendResultToConsumer(conn, inResultChan)
	}

	// TCP
	{
		// Create Connection
		conn := CreateConnTCP()
		if conn == nil {
			return
		}

		// Launch concurrent goroutines
		go SendCommandToConsumer(conn, internalCommandChan)
	}
}
