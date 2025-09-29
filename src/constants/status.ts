// Status Variants
export const STATUS_VARIANTS = {
  CONNECTED: "success",
  CONNECTING: "warning",
  ERROR: "destructive",
  DISCONNECTED: "secondary",
} as const;

// Status Colors
export const STATUS_COLORS = {
  CONNECTED: "bg-green-500",
  CONNECTING: "bg-yellow-500",
  ERROR: "bg-red-500",
  DISCONNECTED: "bg-gray-500",
} as const;
