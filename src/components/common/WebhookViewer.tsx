import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

import ConnectButton from "./ConnectButton";
import MessageCard from "./MessageCard";

import { getStatusVariant, getStatusColor } from "@/lib/statusUtils";

import { WEBHOOK_URL } from "@/constants/ws";

import { useWebhookConnection } from "@/hooks/useWebSocketConnection";

const WebhookViewer = () => {
  const {
    connectionStatus,
    messages,
    disconnect,
    connect,
    handleClearMessages,
  } = useWebhookConnection();

  return (
    <div className="p-3 mx-auto w-full">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3 w-full justify-end">
            <Badge
              className={`flex items-center gap-2 ${getStatusVariant(
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
              className="select-none cursor-pointer"
            />
            <Button
              onClick={handleClearMessages}
              variant={"secondary"}
              className="rounded-md text-sm select-none cursor-pointer"
              aria-label="Clear"
            >
              Clear
            </Button>
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

        {/* Message History */}
        <div>
          <Badge className="font-semibold mb-3 text-md">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </Badge>
          <div className="max-h-112 overflow-y-auto flex gap-2 flex-wrap-reverse flex-row-reverse">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8 w-full">
                No messages received yet
              </p>
            ) : (
              messages.map((message, index) => (
                <MessageCard
                  key={index}
                  message={message}
                  sequenceNumber={index + 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookViewer;
