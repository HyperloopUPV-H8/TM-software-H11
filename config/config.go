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
	} `toml:"sensor"`
	Processor ProcessorCfg `toml:"processor"`
	Logger    LoggerCfg    `toml:"logger"`
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
