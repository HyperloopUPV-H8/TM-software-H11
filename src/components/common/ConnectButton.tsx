import type { ComponentProps } from "react";
import { Button } from "../ui/button";

import type { ConnectionStatus } from "@/types/ConnectionsStatus";

interface ConnectButtonProps
  extends Omit<
    ComponentProps<typeof Button>,
    "onClick" | "disabled" | "children"
  > {
  connectionStatus: ConnectionStatus;
  disconnect: () => void;
  connect: () => void;
}

const ConnectButton = ({
  connectionStatus,
  disconnect,
  connect,
  ...props
}: ConnectButtonProps) => {
  const baseClasses =
    "select-none cursor-pointer transition-all duration-200 font-medium";

  if (connectionStatus === "connected") {
    return (
      <Button
        onClick={disconnect}
        aria-label="Disconnect"
        className={`${baseClasses} bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-sm hover:shadow-md`}
        {...props}
      >
        Disconnect
      </Button>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <Button
        disabled
        aria-label="Connecting"
        className={`${baseClasses} bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed`}
        {...props}
      >
        Connecting...
      </Button>
    );
  }

  if (connectionStatus === "disconnected") {
    return (
      <Button
        onClick={connect}
        aria-label="Connect"
        className={`${baseClasses} bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 shadow-sm hover:shadow-md`}
        {...props}
      >
        Connect
      </Button>
    );
  }

  if (connectionStatus === "error") {
    return (
      <Button
        onClick={connect}
        aria-label="Retry"
        className={`${baseClasses} bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 shadow-sm hover:shadow-md`}
        {...props}
      >
        Retry
      </Button>
    );
  }
};

export default ConnectButton;
