package consumer

import (
	"fmt"
	"io"
	"net"
	"github.com/vasyl-ks/TM-software-H11/config"
)

/*
Listen binds a UDP socket on config.Sender.ClientPort and forwards incoming datagrams to out.
- Copies each datagram into a new slice to avoid buffer reuse.
*/
func Listen(outChan chan<- []byte, ready chan<- struct{}) {
	// Listen for UDP Traffic
	udpAddr, err := net.ResolveUDPAddr("udp", fmt.Sprintf("127.0.0.1:%d", config.Hub.UDPPort))
	if err != nil {
		fmt.Println("Error resolving UDP address:", err)
		return
	}
	udpConn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		fmt.Println("Error listening on UDP:", err)
		return
	}

	// Listen for TCP Traffic
	tcpListener, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", config.Hub.TCPPort))
	if err != nil {
		fmt.Println("Error listening on TCP:", err)
		return
	}

	// Notify that listeners are ready
    close(ready)

	// UDP handler goroutine
	go func() {
		defer udpConn.Close()
		buf := make([]byte, config.Hub.BufferSize)
		for {
			n, _, err := udpConn.ReadFromUDP(buf)
			if err != nil {
				fmt.Printf("Error reading from UDP: %v\n", err)
				continue
			}
			payload := make([]byte, n)
			copy(payload, buf[:n])
			outChan <- payload
		}
	}()

	// TCP handler goroutine
	go func ()  {
		defer tcpListener.Close()
		conn, err := tcpListener.Accept()
			if err != nil {
			fmt.Println("Error accepting TCP connection:", err)
			return
		}
		defer conn.Close()
		buf := make([]byte, config.Hub.BufferSize)
		for {
			n, err := conn.Read(buf)
			if err != nil {
				if err != io.EOF {
					fmt.Printf("Error reading TCP: %v\n", err)
				}
				break
			}
			payload := make([]byte, n)
			copy(payload, buf[:n])
			outChan <- payload
		}
	}()


	for {
		conn, err := tcpListener.Accept()
		if err != nil {
			fmt.Println("Error accepting TCP connection:", err)
			continue
		}

		go func(c net.Conn) {
			defer c.Close()
			buf := make([]byte, config.Hub.BufferSize)
			for {
				n, err := c.Read(buf)
				if err != nil {
					if err != io.EOF {
						fmt.Printf("read TCP: %v\n", err)
					}
					break
				}
				payload := make([]byte, n)
				copy(payload, buf[:n])
				outChan <- payload
			}
		}(conn)
	}
}
