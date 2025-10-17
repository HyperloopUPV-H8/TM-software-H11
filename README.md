# TM-software-H11 

Go backend that exposes telemetry via WebSockets and REST, receives commands from the frontend, and logs activity. It can simulate sensors or receive telemetry over TCP from an external client.

### Features
- WebSocket (gorilla/websocket) for real-time streaming (`/api/stream`).
- REST for recent history (`/api/messages`) and receiving commands (`/api/commands`).
- Sensor simulation (temperature, pressure, 6 battery cells) or TCP server mode to receive telemetry.
- Batch processing (mean/min/max) and broadcast summaries to WS clients.
- Hub with configurable history and fan-out to multiple clients.
- Simple log rotation in `logs/`.



## Configuration
Edit `config.toml`:
- `[network]` sets `address` (TCP) and `http_address` (HTTP/WS).
- `[processor]` sets `batch_size` for statistics.
- `[logger]` sets directory, prefix, and rotation by line count.
- `[websocket]` sets `history_size` (recent messages kept by the hub).
- `[sensor.*]` defines simulated sensors in `client` mode.

Defaults of interest:
- History (`websocket.history_size`): 100
- Batch (`processor.batch_size`): 5

## Run

From the repo root:

### Client mode (simulates sensors and optionally serves HTTP/WS)
```powershell
# Also serve HTTP/WS (default true) - for single-node demo
go run ./cmd/main.go --mode client --serve-http=true

# Only simulate and send over TCP (no local HTTP/WS) - for multi-node setup
go run ./cmd/main.go --mode client --serve-http=false
```

### Server mode (receives telemetry over TCP and serves HTTP/WS)
```powershell
go run ./cmd/main.go --mode server
```

**When to use each mode:**
- **Single-node demo**: Use client mode with `--serve-http=true`. This processes telemetry locally, logs locally, and serves the dashboard locally. No server needed.
- **Multi-node setup**: Use server mode + client mode with `--serve-http=false`. The server centralizes telemetry processing, logging, and dashboard. Clients send data to the server.

**Important for multi-node setup:**
- Only the server should use the HTTP port (default 8080 in the toml). 
- If you get "bind: Only one usage of each socket address" error, it means both processes are trying to use the same port.
- Solution: Use different `http_address` in `config.toml` for clients, or only run clients with `--serve-http=false`.

Addresses and ports are taken from `config.toml`:
- Telemetry TCP: `network.address` (example., `localhost:4040`)
- HTTP/WS: `network.http_address` (ex., `localhost:8080`)

## Endpoints
- `GET /api/messages` — returns a JSON array with the hub's latest envelopes.
- `GET /api/stream` — WebSocket endpoint for real-time envelopes.
- `POST /api/commands` — accepts `{ "action": "pause|resume|launch|set_batch_size|snapshot", ... }` Emits `command_ack` over WS.
- `GET /` — serves `web/index.html` (sample dashboard, super simple).

## Message format (Envelope)
All WS messages follow:

```json
{
  "type": "telemetry|command_ack|snapshot",
  "ts": "RFC3339",
  "seq": 1,
  "payload": {}
}
```

Aggregated telemetry example:

```json
{
  "type": "telemetry",
  "ts": "2025-10-17T18:30:00Z",
  "seq": 123,
  "payload": {
    "sensor": "Temperature",
    "unit": "°C",
    "mean": 23.5,
    "min": 22.8,
    "max": 24.1
  }
}
```

Command ACK example:

```json
{
  "type": "command_ack",
  "ts": "2025-10-17T18:31:01Z",
  "payload": {
    "id": "<uuid>",
    "command": { "action": "pause" },
    "status": "ok"
  }
}
```

## Supported commands
- `launch` — sample action (logs an execution message).
- `pause` / `resume` — pause/resume batch processing.
- `set_batch_size` — requires `{ "value": "10" }` (positive integer in string form).
- `snapshot` — logs the command and broadcasts current state `{ paused, batchSize }` over WS.



## Sample dashboard
- **Single-node**: Open `http://localhost:8080/` (served by client with `--serve-http=true`).
- **Multi-node**: Open `http://localhost:8080/` (served by server, clients send data to server).

**Multi-node setup steps:**
1. Terminal A: `go run ./cmd/main.go --mode server`
2. Terminal B: `go run ./cmd/main.go --mode client --serve-http=false`
3. Open `http://localhost:8080/` (server's dashboard)

Use the buttons to:
- Connect/disconnect WS.
- Send commands using the input JSON.
- See charts (Chart.js) for temperature, pressure, and cells.

## Logs
Logs rotate after `logger.max_lines`. Files are stored in `logs/` using the configured prefix.

## Dev and tests
- Console WS client: `go run ./tools/wsclient` (with server running at `localhost:8080`. Nvm, now it's extracted from the toml). Basically shows you raw messages.
- Run all tests: `go test ./...`
- Test files: `internal/websocket/hub_test.go`, `internal/integration/ws_contract_test.go`, `internal/netsender/integration_test.go`.


