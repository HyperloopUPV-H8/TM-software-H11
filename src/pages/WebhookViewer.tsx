import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import ConnectButton from "../components/common/ConnectButton";
import MetricBox from "../components/common/MetricBox";
import { getStatusVariant, getStatusColor } from "@/lib/statusUtils";
import { WEBHOOK_URL } from "@/constants/urls";
import { useWebhookConnection } from "@/hooks/useWebSocketConnection";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const WebhookViewer = () => {
  useDocumentTitle("Webhook Viewer - Hyperloop H11");

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
    <Card
      role="region"
      aria-labelledby="webhook-viewer-title"
      className="max-w-7xl w-full m-4"
    >
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle id="webhook-viewer-title">Webhook Metrics</CardTitle>
            <CardDescription className="mt-1.5">
              Real-time monitoring of incoming webhook data
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              aria-labelledby={"connection-status"}
              className={`flex items-center gap-2 ${getStatusVariant(
                connectionStatus
              )}`}
            >
              <div
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  connectionStatus
                )}`}
              />
              <span
                id="connection-status"
                className="text-sm font-medium capitalize"
              >
                {connectionStatus}
              </span>
            </Badge>

            <ConnectButton
              className="bg-gradient-to-br from-primary/5 to-primary/10 text-primary hover:bg-primary/10"
              connectionStatus={connectionStatus}
              disconnect={disconnect}
              connect={connect}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground pt-2">
          Endpoint:{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            {WEBHOOK_URL}
          </code>
        </div>
      </CardHeader>

      <CardContent>
        {/* Metrics boxes - grid ensures same size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(lastMetrics).map(([key, metricData]) => (
            <MetricBox
              key={key}
              metricLabel={key}
              metricData={metricData}
              currentTime={currentTime}
            />
          ))}
        </div>

        {Object.keys(lastMetrics).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No metrics received yet</p>
            <p className="text-xs mt-1">
              Connect to start receiving webhook data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookViewer;
