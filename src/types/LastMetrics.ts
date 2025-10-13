export type LastMetrics = {
  humidity: { value: number; lastUpdated: Date };
  temperature: { value: number; lastUpdated: Date };
  signal_strength: { value: number; lastUpdated: Date };
  battery_level: { value: number; lastUpdated: Date };
};
