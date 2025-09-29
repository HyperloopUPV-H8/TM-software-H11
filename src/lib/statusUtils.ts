import { STATUS_VARIANTS, STATUS_COLORS } from "@/constants/status";
import type { ConnectionStatus } from "@/types/ConnectionsStatus";

export const getStatusVariant = (connectionStatus: ConnectionStatus) => {
  switch (connectionStatus) {
    case "connected":
      return STATUS_VARIANTS.CONNECTED;
    case "connecting":
      return STATUS_VARIANTS.CONNECTING;
    case "error":
      return STATUS_VARIANTS.ERROR;
    default:
      return STATUS_VARIANTS.DISCONNECTED;
  }
};

export const getStatusColor = (connectionStatus: ConnectionStatus) => {
  switch (connectionStatus) {
    case "connected":
      return STATUS_COLORS.CONNECTED;
    case "connecting":
      return STATUS_COLORS.CONNECTING;
    case "error":
      return STATUS_COLORS.ERROR;
    default:
      return STATUS_COLORS.DISCONNECTED;
  }
};
