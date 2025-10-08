import { create } from "zustand";

const categoriesMap = {
  temperature: "TEMPERATURE",
  humidity: "HUMIDITY",
  battery_level: "BATTERY",
  signal_strength: "SIGNAL",
  timestamp: "TIME"
};

export const useDataStore = create((set) => ({
  data: {
    TEMPERATURE: [],
    HUMIDITY: [],
    BATTERY: [],
    SIGNAL: [],
    TIME: [],
  },
  updateCategory: (category, value) =>
    set((state) => {
      const newEntry = {
        value,
        timestamp: category === "TIME" ? value : new Date().toLocaleTimeString()
      };
      const updated = [newEntry, ...state.data[category]].slice(0, 5);
      return { data: { ...state.data, [category]: updated } };
    }),
}));

const sw = new WebSocket("ws://localhost:3000/api/stream");

sw.onopen = () => console.log("WebSocket connected to backend");

sw.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    console.log("Received via WebSocket:", msg);

    Object.entries(msg).forEach(([key, value]) => {
      const cat = categoriesMap[key];
      if (cat && value !== undefined) {
        useDataStore.getState().updateCategory(cat, value);
      }
    });
  } catch (err) {
    console.error("Error processing WebSocket message:", err);
  }
};

sw.onerror = (err) => console.error("WebSocket error:", err);
sw.onclose = () => console.warn("WebSocket closed");
