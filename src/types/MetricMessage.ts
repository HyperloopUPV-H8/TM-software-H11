export default interface MetricMessage {
  timestamp: string;
  humidity?: number;
  temperature?: number;
  signal_strength?: number;
  battery_level?: number;
}
