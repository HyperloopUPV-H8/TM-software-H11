package logger

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
)

// Logger wraps a log.Logger with rotation logic.
type Logger struct {
	dir      string
	prefix   string
	maxLines int
	lineCnt  int
	file     *os.File
	logger   *log.Logger
}

// New creates a new rotating logger.
func New(dir, prefix string, maxLines int) (*Logger, error) {
	// Ensure log directory exists
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log dir: %w", err)
	}

	l := &Logger{
		dir:      dir,
		prefix:   prefix,
		maxLines: maxLines,
	}
	if err := l.rotateFile(); err != nil {
		return nil, err
	}
	return l, nil
}

// rotateFile closes the current log file and opens a new one.
func (l *Logger) rotateFile() error {
	if l.file != nil {
		l.file.Close()
	}

	filename := fmt.Sprintf("%s_%s.log",
		l.prefix, time.Now().Format("20060102_150405"))
	path := filepath.Join(l.dir, filename)

	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return fmt.Errorf("failed to open log file: %w", err)
	}

	l.file = file
	l.logger = log.New(file, "INFO: ", log.Ldate|log.Ltime)
	l.lineCnt = 0
	return nil
}

// Printf writes a formatted log message and rotates the file if needed.
func (l *Logger) Printf(format string, v ...interface{}) {
	l.logger.Printf(format, v...)
	l.lineCnt++
	if l.lineCnt >= l.maxLines {
		_ = l.rotateFile()
	}
}

// Close closes the underlying log file.
func (l *Logger) Close() {
	if l.file != nil {
		l.file.Close()
	}
}
