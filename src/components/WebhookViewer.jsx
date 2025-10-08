import React from "react";
import { useDataStore } from "../store/dataStore";

export default function WebhookViewer() {
  const data = useDataStore((state) => state.data);

  const categories = ["TEMPERATURE", "PRESSURE", "VOLTAGE", "CURRENT", "TIME"];

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">Waiting for data...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((key) => {
        const entries = data[key] || [];
        const last = entries[0];

        return (
          <div
            key={key}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-700 capitalize">{key}</h2>
              <p className="text-4xl font-bold mt-4 text-blue-600">{last ? last.value : "--"}</p>
              <p className="text-xs text-gray-500 mt-1">{last ? last.timestamp : ""}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

