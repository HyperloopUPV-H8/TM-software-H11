package sensor

// Stats represents aggregated statistics for a batch of readings.
type Stats struct {
	Mean float64
	Min  float64
	Max  float64
}

// Process just processes
func Process(values []float64) Stats {
	if len(values) == 0 {
		return Stats{}
	}

	min, max, sum := values[0], values[0], 0.0
	for _, v := range values {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
		sum += v
	}

	return Stats{
		Mean: sum / float64(len(values)),
		Min:  min,
		Max:  max,
	}
}
