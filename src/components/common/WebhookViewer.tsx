import { Badge } from "../ui/badge";

import ConnectButton from "./ConnectButton";

import { getStatusVariant, getStatusColor } from "@/lib/statusUtils";

import { WEBHOOK_URL } from "@/constants/ws";

import { useWebhookConnection } from "@/hooks/useWebSocketConnection";

import MetricBox from "./MetricBox";
import { useEffect, useState } from "react";

const WebhookViewer = () => {
  const { connectionStatus, lastMetrics, disconnect, connect } =
    useWebhookConnection();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-3 mx-auto w-full">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3 w-full justify-end">
            <Badge
              className={`flex items-center gap-2 bg-primary/10 text-primary border-primary/20 ${getStatusVariant(
                connectionStatus
              )}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  connectionStatus
                )}`}
              ></div>
              <span className="text-sm font-medium capitalize">
                {connectionStatus}
              </span>
            </Badge>

            <ConnectButton
              connectionStatus={connectionStatus}
              disconnect={disconnect}
              connect={connect}
              className="select-none cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            />
          </div>
        </div>

        <div className="mb-4 text-right">
          <p className="text-sm text-gray-600">
            Connected to:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded shadow-md">
              {WEBHOOK_URL}
            </code>
          </p>
        </div>

        {/* Metrics boxes */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(lastMetrics).map(([key, metricData]) => (
            <MetricBox
              key={key}
              metricLabel={key}
              metricData={metricData}
              currentTime={currentTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebhookViewer;
