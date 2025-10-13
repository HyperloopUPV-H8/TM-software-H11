# TM Software H11: Task 3

This Go project simulates a complete vehicle telemetry system.
It connects multiple components — a **Generator**, **Hub**, **Consumer**, and a **Frontend (WebSocket)** — that exchange telemetry and control commands in real time.

## Table of Contents
* [Features](#features)
* [Repository Layout](#repository-layout)
* [Getting Started](#getting-started)
* [Configuration](#configuration)
* [System Flow](#system-flow)
* [Development Notes](#development-notes)

## Features
* Synthetic **Generator** that simulates a vehicle, producing random sensor data (speed, pressure, temperature).
* **Hub** that routes data and commands between Generator, Consumer, and Frontend:

  * `ResultData` is sent to both the Frontend (WS) and Consumer (UDP).
  * `Command` messages flow from the Frontend (WS) to the Generator and Consumer (TCP).
* **Consumer** that receives and logs both telemetry results and commands in rotating `.jsonl` files.
* Real-time **WebSocket communication** with the Frontend for live telemetry and remote control.
* Dynamic **command handling**: the vehicle can start, stop, accelerate, or change driving mode (`eco`, `normal`, `speed`).
* Centralized **config system** controlling intervals, modes, and ports.
* Includes an automated **test suite** that simulates a frontend connection sending commands and logging responses.

## Repository Layout

```
TM-software-H11/
│   .gitignore
│   config.json
│   go.mod
│   go.sum
│   main_test.go
│   main.go
│   README.md
├───config
│       config.go
├───internal
│   ├───consumer
│   │       consumer.go
│   │       listener.go
│   │       logger.go
│   │       parser.go
│   ├───generator
│   │       generator.go
│   │       processor.go
│   │       sensor.go
│   ├───hub
│   │       hub.go
│   │       tcphandler.go
│   │       updhandler.go
│   │       wshandler.go
│   │
│   └───model
│           command.go
│           resultData.go
│           sensorData.go
├───logs
└───test_logs
```

## Getting Started

1. Install Go 1.21 or newer.
2. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/vasyl-ks/TM-software-H11.git
   cd TM-software-H11
   ```
3. Inspect and adjust `config.json` for your desired intervals, ports, and speed mode ratios.
4. Run the system:

   ```bash
   go run main.go
   ```
5. Optionally, execute tests to simulate a frontend:

   ```bash
   go test -v
   ```
6. Watch logs under `/logs` — telemetry and commands are saved as `.jsonl` files.

## Configuration
`config.json` defines the runtime behavior and communication parameters:
* **Vehicle**
  * `vehicleID`: unique identifier for telemetry.
* **Sensor**
  * `intervalMilliSeconds`: how often new sensor data is generated.
  * `minSpeed`, `maxSpeed`, `minPressure`, `maxPressure`, `minTemp`, `maxTemp`: generation ranges.
  * `ecoMode`, `normalMode`, `speedMode`: scaling ratios for maximum speed behavior.
* **Processor**
  * `intervalMilliSeconds`: how often readings are aggregated into statistics.
* **Logger**
  * `maxLines`: maximum lines per log file before rotation.
  * `fileDir`: directory for log storage.
* **Hub**
  * `udpPort`, `tcpPort`, `wsPort`: network ports for communication.
  * `bufferSize`: size for UDP/TCP packet buffers.
Configuration is read once at process start; update the file and restart the application to apply changes.

## System Flow
1. **Generator**
   * `Sensor` continuously emits simulated sensor readings.
   * Receives `Command` messages to alter vehicle behavior (start, stop, accelerate, mode).
   * `Process` aggregates data into `ResultData` summaries and sends them to the Hub.
2. **Hub**
   * Acts as the central bridge between Generator, Frontend, and Consumer.
   * Forwards telemetry (`ResultData`) to:
     * Consumer (via UDP)
     * Frontend (via WebSocket)
   * Forwards control commands (`Command`) from the Frontend (via WebSocket) to:
     * Generator (via internal channel)
     * Consumer (via TCP)
3. **Consumer**
   * Listens for UDP results and TCP commands.
   * Parses both `ResultData` and `Command` messages.
   * Logs entries into rotating `.jsonl` files with timestamps.
4. **Frontend**
   * Connects via WebSocket to `/api/stream`.
   * Sends commands (`{"action": "start"}` etc.) and receives live telemetry.
5. **Tests**
   * `main_test.go` simulates a frontend connection, sends commands with delays, and validates Hub responses.
   * Watch test logs under `/test_logs` — saved as `.jsonl` files.

## Development Notes
* The system is fully concurrent, using goroutines and channels for communication.
* Each transport layer (UDP, TCP, WS) runs independently but shares data via the Hub.
* Generator speed adjusts based on commands in real time.
* Frontend tests provide an end-to-end check of the communication pipeline.
* Logs in `.jsonl` format are machine- and human-readable, suitable for further analysis.
* At this moment, temperature and pressure values are independent and randomly generated; they are not linked to vehicle state.
* Once the program starts, the vehicle begins sending telemetry automatically, but it must be started and accelerated through commands to simulate motion.
