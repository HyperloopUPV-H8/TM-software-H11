import React from "react";
import { useDataStore } from "../store/dataStore";

export default function WebhookDashboard() {
  const data = useDataStore((state) => state.data);
  const COLORS = {
    TEMPERATURE: "from-red-500 to-orange-400",
    HUMIDITY: "from-blue-500 to-cyan-400",
    BATTERY: "from-yellow-500 to-amber-400",
    SIGNAL: "from-green-500 to-emerald-400",
    TIME: "from-purple-500 to-pink-400",
  };
  
  const categories = ["TEMPERATURE", "HUMIDITY", "BATTERY", "SIGNAL"];

  return (
    <div className="text-white flex flex-wrap justify-center gap-8 p-10">
      {categories.map((cat) => {
        const entries = data[cat] || [];
        const last = entries[0];

        return (
          <div
            key={cat}
            className={`bg-gradient-to-br ${COLORS[cat]} p-6 rounded-2xl shadow-xl w-72 transform hover:scale-105 transition-all`}
          >
            <h2 className="text-2xl font-bold mb-1 text-center">{cat}</h2>
            <p className="text-xs text-gray-200 mb-4 text-center">
              {last ? last.timestamp : "--"}
            </p>

            <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
              <p className="text-4xl font-mono text-center">{last ? last.value : "--"}</p>
            </div>

            <details className="bg-black bg-opacity-30 rounded-lg p-2">
              <summary className="cursor-pointer text-sm text-gray-100">Last 5 values</summary>
              <ul className="mt-2 text-sm space-y-1">
                {entries.map((entry, i) => (
                  <li key={i} className="flex justify-between text-gray-200 border-b border-gray-600 pb-1">
                    <span>{entry.value}</span>
                    <span className="text-xs">{entry.timestamp}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        );
      })}
    </div>
  );
}
