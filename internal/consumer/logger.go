package consumer

import (
	"fmt"
	"os"
	"time"
	"log"
	"github.com/vasyl-ks/TM-software-H11/config"
	"github.com/vasyl-ks/TM-software-H11/internal/model"
)

/*
Log receives ResultData and Command messages from their respective channels
and logs them to rotating log files.
- Each file contains up to maxLines entries.
- Once the limit is reached, the current file is closed and a new file is created.
- Files are named using the creation timestamp in the format "YYYYMMDD_hhmmss".
- If terminated early, the current file may have fewer than maxLines; a new file is created on the next run.
*/
func Log(inResultChan <-chan model.ResultData, inCommandChan <-chan model.Command) {
	lineCount := 0
	fileDir := config.Logger.FileDir // defines directory where the log is saved.
	maxLines := config.Logger.MaxLines // defines the maximum number of ResultData to log in a single file.

	// Check directory
	err := os.MkdirAll(fileDir, 0755)
	if err != nil {
		fmt.Println("Error creating directory:", err)
		return
	}

	// Create a new file
	filename := fmt.Sprintf("%s/sensor_log_%s.jsonl", fileDir, time.Now().Format("20060102_150405"))
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Println("Error opening log file:", err)
		return
	}
	defer file.Close()
	log.SetOutput(file)
	log.SetFlags(0)

	for {
		select {
			// Receive ResultData
			case resultData, ok := <-inResultChan:
			if !ok {
				inResultChan = nil // channel closed
				continue
			}
			// Log in the file
       		log.Printf(
        	    "[DATA] || Created at %s, Processed at %s, Logged at %s | AvgSpeed: %5.2f, MinSpeed: %5.2f, MaxSpeed: %5.2f | AvgTemp: %5.2f, MinTemp: %5.2f, MaxTemp: %5.2f | AvgPressure: %4.2f, MinPressure: %4.2f, MaxPressure: %4.2f ||\n",
        	    resultData.CreatedAt.Format("15:04:05.000000"),
        	    resultData.ProcessedAt.Format("15:04:05.000000"),
        	    time.Now().Local().Format("15:04:05.000000"),
        	    resultData.AverageSpeed, 	resultData.MinSpeed, 	resultData.MaxSpeed,
        	    resultData.AverageTemp, 	resultData.MinTemp, 	resultData.MaxTemp,
        	    resultData.AveragePressure, resultData.MinPressure, resultData.MaxPressure,
			)

			// Receive ResultData
			case cmd, ok := <-inCommandChan:
			if !ok {
				inCommandChan = nil // channel closed
				continue
			}
			// Log in the file
			log.Printf("[COMMAND] || Received at %s | Action: %s | Params: %+v ||",
				time.Now().Local().Format("15:04:05.000000"),
				cmd.Action,
				cmd.Params,
			)
		}

		// Exit if both channels are closed
		if inResultChan == nil && inCommandChan == nil {
			break
		}

		lineCount++
		if lineCount >= maxLines {
			file.Close()
			
			// Create a new file
			filename := fmt.Sprintf("%s/sensor_log_%s.jsonl", fileDir, time.Now().Format("20060102_150405"))
			file, err = os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
			if err != nil {
				fmt.Println("Error opening new log file:", err)
				return
			}
			defer file.Close()
			log.SetOutput(file)

			lineCount = 0
		}
	}
}
