import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import MetricBox from "./MetricBox";
import { WEBHOOK_URL } from "@/constants/urls";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import type { LastMetrics } from "@/types/LastMetrics";

interface WebhookViewerProps {
  lastMetrics: LastMetrics;
  currentTime: Date;
}

const WebhookViewer = ({ lastMetrics, currentTime }: WebhookViewerProps) => {
  useDocumentTitle("Webhook Viewer - Hyperloop H11");

  return (
    <Card
      role="region"
      aria-labelledby="webhook-viewer-title"
      className="w-full m-4 flex-2"
    >
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center mb-4">
          <div>
            <CardTitle id="webhook-viewer-title">Webhook Metrics</CardTitle>
            <CardDescription className="mt-1.5">
              Real-time monitoring of incoming webhook data
            </CardDescription>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Endpoint:{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            {WEBHOOK_URL}
          </code>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-4 gap-4">
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
