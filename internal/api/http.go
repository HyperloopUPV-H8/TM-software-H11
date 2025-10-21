package api

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"backend/internal/websocket"
)

func StartHTTP(ctx context.Context, wg *sync.WaitGroup, addr string, hub *websocket.Hub, logf func(string, ...interface{}), commandCh chan<- map[string]string) error {
	mux := http.NewServeMux()
	// serve static files from the web/ directory at root
	fs := http.FileServer(http.Dir("./web"))
	mux.Handle("/", fs)
	mux.HandleFunc("/api/stream", func(w http.ResponseWriter, r *http.Request) {
		websocket.HandleWS(hub, w, r)
	})
	mux.HandleFunc("/api/commands", websocket.HandleCommands(logf, commandCh))
	mux.HandleFunc("/api/messages", websocket.HandleMessages(hub))

	logged := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// minimal log to stdout; caller provided logf can be nil
		println(time.Now().Format(time.RFC3339), "http: recv", r.RemoteAddr, r.Method, r.URL.Path)
		mux.ServeHTTP(w, r)
	})

	srv := &http.Server{
		Addr:    addr,
		Handler: logged,
	}

	fmt.Printf("http: starting server on %s\n", addr)
	wg.Add(1)
	go func() {
		defer wg.Done()
		// run server
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {

			fmt.Printf("http server error: %v\n", err)
		}
	}()

	go func() {
		<-ctx.Done()
		ctxShutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(ctxShutdown)
	}()

	return nil
}
