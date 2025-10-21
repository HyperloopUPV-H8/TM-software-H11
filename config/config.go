package config

import (
	"time"

	"github.com/BurntSushi/toml"
)

// holds config for a single sensor.
type SensorCfg struct {
	Name     string  `toml:"name"`
	Unit     string  `toml:"unit"`
	Min      float64 `toml:"min"`
	Max      float64 `toml:"max"`
	PeriodMS int     `toml:"period_ms"`
}

// defines batch size for processing.
type ProcessorCfg struct {
	BatchSize int `toml:"batch_size"`
}

// defines logging behavior.
type LoggerCfg struct {
	Dir      string `toml:"dir"`
	Prefix   string `toml:"prefix"`
	MaxLines int    `toml:"max_lines"`
}

type Config struct {
	Sensor struct {
		Temperature SensorCfg `toml:"temperature"`
		Pressure    SensorCfg `toml:"pressure"`
		Cell1       SensorCfg `toml:"cell_1"`
		Cell2       SensorCfg `toml:"cell_2"`
		Cell3       SensorCfg `toml:"cell_3"`
		Cell4       SensorCfg `toml:"cell_4"`
		Cell5       SensorCfg `toml:"cell_5"`
		Cell6       SensorCfg `toml:"cell_6"`
	} `toml:"sensor"`
	Processor ProcessorCfg `toml:"processor"`
	Logger    LoggerCfg    `toml:"logger"`
	Network   NetworkCfg   `toml:"network"`

	Netsender NetsenderCfg `toml:"netsender"`

	Websocket struct {
		HistorySize int `toml:"history_size"`
	} `toml:"websocket"`
}

// Load reads configuration from a TOML file.
func Load(path string) (*Config, error) {
	var cfg Config
	if _, err := toml.DecodeFile(path, &cfg); err != nil { //unmarshal with pelletier
		return nil, err
	}
	return &cfg, nil
}

func (s SensorCfg) Period() time.Duration {
	return time.Duration(s.PeriodMS) * time.Millisecond
}

type NetworkCfg struct {
	Mode     string `toml:"mode"`         // "server" or "client"
	Protocol string `toml:"protocol"`     // "tcp" or "udp" ...
	Address  string `toml:"address"`      // ...
	HTTPAddr string `toml:"http_address"` // address for HTTP/WS server
}

// NetsenderCfg controls dialing and backoff behavior for the netsender.
type NetsenderCfg struct {
	DialTimeoutMS    int `toml:"dial_timeout_ms"`
	WriteTimeoutMS   int `toml:"write_timeout_ms"`
	InitialBackoffMS int `toml:"initial_backoff_ms"`
	MaxBackoffMS     int `toml:"max_backoff_ms"`
}
