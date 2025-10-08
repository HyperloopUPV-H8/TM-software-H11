export default interface MetricMessage {
  timestamp: string;
  humidity?: string;
  temperature?: string;
  signal_strength?: string;
  battery_level?: string;
}
