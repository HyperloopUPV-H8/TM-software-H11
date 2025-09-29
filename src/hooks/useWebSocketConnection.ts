import { useWebSocket } from "./useWebSocket";
import { useCallback } from "react";
import { ToastNotifications } from "@/lib/notifications";
import { CONSOLE_MESSAGES } from "@/constants/messages";
import { WEBHOOK_URL } from "@/constants/ws";
import type MetricMessage from "@/types/MetricMessage";

export const useWebhookConnection = () => {
  // Function executed when a new message is received
  const handleMessage = useCallback((data: MetricMessage) => {
    ToastNotifications.showNewMessage();
    console.log(CONSOLE_MESSAGES.NEW_MESSAGE, data);
  }, []);

  // Function executed when the webhook server is connected
  const handleOpen = useCallback(() => {
    console.log(CONSOLE_MESSAGES.CONNECTED);
  }, []);

  const handleConnect = useCallback(() => {
    ToastNotifications.showConnected();
    console.log(CONSOLE_MESSAGES.CONNECTED);
  }, []);

  // Function executed when the webhook server is connected
  // It is a separate function because it needs function that returns the promise as a parameter
  // To be used in the toast notification later
  const handleConnectAsync = useCallback(
    (connectAsync: () => Promise<void>) => {
      ToastNotifications.showConnecting(connectAsync());
    },
    []
  );

  // Function executed when an error occurs
  const handleError = useCallback((error: Event) => {
    ToastNotifications.showError();
    console.error(CONSOLE_MESSAGES.WEBSOCKET_ERROR, error);
  }, []);

  // Function executed when the webhook server is disconnected
  const handleClose = useCallback(() => {
    console.log(CONSOLE_MESSAGES.DISCONNECTED);
  }, []);

  const handleDisconnect = useCallback(() => {
    ToastNotifications.showDisconnected();
    console.log(CONSOLE_MESSAGES.DISCONNECTED);
  }, []);

  // Function executed when the webhook server is disconnected
  // It is a separate function because it needs function that returns the promise as a parameter
  // To be used in the toast notification later
  const handleDisconnectAsync = useCallback(
    (disconnectAsync: () => Promise<void>) => {
      ToastNotifications.showDisconnecting(disconnectAsync());
    },
    []
  );

  const webSocketCallbacks = {
    onMessage: handleMessage,
    onOpen: handleOpen,
    onClose: handleClose,
    onError: handleError,
    onConnectAsync: handleConnectAsync,
    onDisconnectAsync: handleDisconnectAsync,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  };

  const webSocketHook = useWebSocket({
    url: WEBHOOK_URL,
    autoConnect: true,
    ...webSocketCallbacks,
  });

  // Function executed when the messages are cleared
  const handleClearMessages = useCallback(() => {
    webSocketHook.clearMessages();
    ToastNotifications.showMessagesCleared();
  }, [webSocketHook]);

  // Same function as handleConnect, but with webSocketHook passed as dependency
  // To avoid ESLint dependendy array error
  // And so it can be used later in the component
  const connect = useCallback(() => {
    handleConnectAsync(webSocketHook.connectAsync);
  }, [webSocketHook, handleConnectAsync]);

  // Same function as handleDisconnect, but with webSocketHook passed as dependency
  // To avoid ESLint dependendy array error
  // And so it can be used later in the component
  const disconnect = useCallback(() => {
    handleDisconnectAsync(webSocketHook.disconnectAsync);
  }, [webSocketHook, handleDisconnectAsync]);

  return {
    ...webSocketHook,
    handleClearMessages,
    disconnect,
    connect,
  };
};
