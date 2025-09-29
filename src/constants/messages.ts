// Toast Messages
export const TOAST_MESSAGES = {
  NEW_MESSAGE: "New webhook message received",
  CONNECTED: "Connected to webhook server",
  DISCONNECTED: "Disconnected from webhook server",
  CONNECTING: "Connecting to webhook server",
  DISCONNECTING: "Disconnecting from webhook server",
  ERROR: "Error connecting to webhook server",
  MESSAGES_CLEARED: "Messages cleared",
} as const;

// Toast Descriptions
export const TOAST_DESCRIPTIONS = {
  NEW_MESSAGE: (date: string) => date,
  CONNECTED: "You are now connected to the webhook server",
  DISCONNECTED: "You are now disconnected from the webhook server",
  CONNECTING: "Please wait while we connect to the webhook server",
  DISCONNECTING: "Please wait while we disconnect from the webhook server",
  ERROR: "Please check your internet connection and try again",
  MESSAGES_CLEARED: "All messages have been cleared",
} as const;

// Console Messages
export const CONSOLE_MESSAGES = {
  NEW_MESSAGE: "New webhook message received:",
  CONNECTED: "Connected to webhook server",
  DISCONNECTED: "Disconnected from webhook server",
  WEBSOCKET_ERROR: "WebSocket error:",
} as const;
