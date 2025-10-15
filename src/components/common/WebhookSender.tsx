import { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ToastNotifications } from "@/lib/notifications";
import { COMMAND_GROUPS } from "@/constants/commands";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import type Command from "@/types/Command";
import CommandButton from "@/components/common/CommandButton";
import ConnectButton from "@/components/common/ConnectButton";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusVariant } from "@/lib/statusUtils";
import type { ConnectionStatus } from "@/types/ConnectionsStatus";
import { ChevronDown } from "lucide-react";

interface WebhookSenderProps {
  sendCommand: (command: Command) => void;
  connectionStatus: ConnectionStatus;
  disconnect: () => void;
  connect: () => void;
}

const WebhookSender = ({
  sendCommand,
  connectionStatus,
  disconnect,
  connect,
}: WebhookSenderProps) => {
  useDocumentTitle("Webhook Sender - Hyperloop H11");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      COMMAND_GROUPS.map((group) => [group.title, group.defaultOpen])
    )
  );

  const handleSendCommand = useCallback(
    async (command: Command) => {
      try {
        sendCommand(command);
        ToastNotifications.showCommandResult(command);
        console.log("Command sent successfully", command);
      } catch (error: unknown) {
        ToastNotifications.showTextError(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error instanceof Error ? error.message : (error as any).toString()
        );
        console.error(error instanceof Error ? error.message : error);
      }
    },
    [sendCommand]
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Card
      role="region"
      aria-label="Command sender section"
      className="w-full m-4 flex-1 max-w-xl sticky right-5 top-5"
    >
      <CardHeader>
        <div className="flex justify-between flex-col xl:flex-row items-center px-0 xl:px-2 gap-4">
          <div>
            <CardTitle className="text-center: lg: text-left text-sm tracking-wide mb-2">
              Command Sender
            </CardTitle>
            <CardDescription className="text-center: lg:text-left">
              Send predefined actions
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2">
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
      </CardHeader>

      <CardContent className="space-y-3">
        {COMMAND_GROUPS.map((group) => (
          <Collapsible
            key={group.title}
            open={openSections[group.title]}
            onOpenChange={() => toggleSection(group.title)}
          >
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <CollapsibleTrigger className="flex w-full mb-0 items-center justify-between hover:opacity-80 transition-opacity">
                <div className="flex flex-col items-start text-left">
                  <h4 className="text-sm font-semibold">{group.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openSections[group.title] ? "transform rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2 pt-1 mt-2">
                {group.commands.map(
                  ({
                    action,
                    label,
                    params,
                    fixedParams,
                    variant,
                    classname,
                  }) => (
                    <CommandButton
                      key={`${action}-${label}`}
                      label={label}
                      action={action}
                      params={params}
                      fixedParams={fixedParams}
                      variant={variant}
                      classname={classname}
                      onSendCommand={handleSendCommand}
                    />
                  )
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default WebhookSender;
