import type { ConnectionStatus } from "@/types/ConnectionsStatus";
import type MetricMessage from "@/types/MetricMessage";
import { useState, useEffect, useRef, useCallback } from "react";

export interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  onMessage?: (data: MetricMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onConnectAsync?: (connectAsync: () => Promise<void>) => void;
  onConnect?: () => void;
  onDisconnectAsync?: (disconnectAsync: () => Promise<void>) => void;
  onDisconnect?: () => void;
}

export interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  messages: MetricMessage[];
  lastMetrics: LastMetrics;
  connect: () => void;
  connectAsync: () => Promise<void>;
  disconnect: () => void;
  disconnectAsync: () => Promise<void>;
  clearMessages: () => void;
  sendMessage: (message: string) => void;
  onConnect?: () => void;
  onConnectAsync?: (connectAsync: () => Promise<void>) => void;
  onDisconnect?: () => void;
  onDisconnectAsync?: (disconnectAsync: () => Promise<void>) => void;
}

type LastMetrics = {
  humidity: { value: number; lastUpdated: Date };
  temperature: { value: number; lastUpdated: Date };
  signal_strength: { value: number; lastUpdated: Date };
  battery_level: { value: number; lastUpdated: Date };
};

export const useWebSocket = (
  options: UseWebSocketOptions
): UseWebSocketReturn => {
  const {
    url,
    autoConnect = true,
    onMessage,
    onOpen,
    onClose,
    onError,
    onConnect,
    onConnectAsync,
    onDisconnect,
    onDisconnectAsync,
  } = options;

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const [messages, setMessages] = useState<MetricMessage[]>([]);
  const [lastMetrics, setLastMetrics] = useState<LastMetrics>({
    humidity: { value: 0, lastUpdated: new Date() },
    temperature: { value: 0, lastUpdated: new Date() },
    signal_strength: { value: 0, lastUpdated: new Date() },
    battery_level: { value: 0, lastUpdated: new Date() },
  });

  const wsRef = useRef<WebSocket | null>(null);

  const connectAsync = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setConnectionStatus("connecting");

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 5000);

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        clearTimeout(timeout);
        setConnectionStatus("connected");
        onOpen?.();
        resolve();
      };

      wsRef.current.onerror = (error) => {
        clearTimeout(timeout);
        setConnectionStatus("error");
        onError?.(error);
        reject(new Error("Connection failed"));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const receivedData: MetricMessage = JSON.parse(event.data);

          setMessages((prev) => {
            const newMessages = [...prev, receivedData];
            return newMessages.slice(-50);
          });

          setLastMetrics((prev) => {
            const updated = { ...prev };
            let hasChanges = false;

            // Use timestamp from the message, fallback to current time if not available
            const messageTimestamp = receivedData.timestamp
              ? new Date(receivedData.timestamp)
              : new Date();

            // Dynamically update any metric that exists in the received data
            Object.keys(receivedData).forEach((key) => {
              if (
                key !== "timestamp" &&
                receivedData[key as keyof MetricMessage] !== undefined
              ) {
                const newValue = parseFloat(
                  receivedData[key as keyof MetricMessage] as string
                );
                if (updated[key as keyof LastMetrics]?.value !== newValue) {
                  updated[key as keyof LastMetrics] = {
                    value: newValue,
                    lastUpdated: messageTimestamp,
                  };
                  hasChanges = true;
                }
              }
            });

            // Only return new object if there are actual changes
            return hasChanges ? updated : prev;
          });

          onMessage?.(receivedData);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          // Handle non-JSON messages
          setMessages((prev) => [...prev, event.data]);
          onMessage?.(event.data);
        }
      };

      wsRef.current.onclose = () => {
        setConnectionStatus("disconnected");
        onClose?.();
      };
    });
  }, [url, onOpen, onError, onClose, onMessage]);

  const connect = useCallback(() => {
    connectAsync().catch((error) => {
      console.error("Error connecting to WebSocket:", error);
    });
  }, [connectAsync]);

  const disconnectAsync = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus("disconnected");
      resolve();
    });
  }, []);

  const disconnect = useCallback(() => {
    disconnectAsync().catch((error) => {
      console.error("Error disconnecting from WebSocket:", error);
    });
  }, [disconnectAsync]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      // If onConnect is provided, use it to connect and pass the connection promise
      // Otherwise, use the connect function
      if (onConnectAsync) {
        onConnectAsync(connectAsync);
      } else {
        connect();
        onConnect?.();
      }
    }

    return () => {
      // If onDisconnect is provided, use it to disconnect and pass the disconnection promise
      // Otherwise, use the disconnect function
      if (onDisconnectAsync) {
        onDisconnectAsync(disconnectAsync);
      } else {
        disconnect();
        onDisconnect?.();
      }
    };
  }, [
    autoConnect,
    onConnectAsync,
    onDisconnect,
    connect,
    disconnect,
    connectAsync,
    disconnectAsync,
    onConnect,
    onDisconnectAsync,
  ]);

  return {
    connectionStatus,
    messages,
    lastMetrics,
    connect,
    connectAsync,
    disconnect,
    disconnectAsync,
    clearMessages,
    sendMessage,
  };
};
