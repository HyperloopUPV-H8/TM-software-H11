import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { sendCommand } from "@/lib/api";
import { ToastNotifications } from "@/lib/notifications";
import { API_URL } from "@/constants/urls";
import type { Action } from "@/types/Action";
import { ACTIONS } from "@/constants/actions";
import { Spinner } from "../components/ui/spinner";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const WebhookSender = () => {
  useDocumentTitle("Webhook Sender - Hyperloop H11");

  const [pendingActions, setPendingActions] = useState<Set<Action>>(new Set());

  // Memoized helper to add action to pending set
  const addPending = useCallback((action: Action) => {
    setPendingActions((prev) => new Set(prev).add(action));
  }, []);

  // Memoized helper to remove action from pending set
  const removePending = useCallback((action: Action) => {
    setPendingActions((prev) => {
      const next = new Set(prev);
      next.delete(action);
      return next;
    });
  }, []);

  const handleSendCommand = useCallback(
    async (action: Action) => {
      // Skip if already pending
      if (pendingActions.has(action)) return;

      addPending(action);

      try {
        const req = sendCommand(action);
        ToastNotifications.showCommandResult(req, action);

        const res = await req;
        console.log("Command sent successfully", res);
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
      } finally {
        removePending(action);
      }
    },
    [pendingActions, addPending, removePending]
  );

  return (
    <Card
      role="region"
      aria-label="Command sender section"
      className="max-w-xl w-full m-4"
    >
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide mb-2">
          Command Sender
        </CardTitle>
        <CardDescription>
          Send predefined actions to your backend.
        </CardDescription>
        <div className="text-sm text-muted-foreground mt-1">
          Endpoint:{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted">
            {API_URL}/api/command
          </code>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIONS.map(({ label, action, variant, classname }) => {
            const isLoading = pendingActions.has(action);
            return (
              <Button
                key={action}
                variant={variant}
                onClick={() => handleSendCommand(action)}
                disabled={isLoading}
                aria-label={`Send ${action} command`}
                aria-busy={isLoading}
                className={`w-full transition-all ${classname ?? ""}`}
              >
                {isLoading && <Spinner aria-hidden="true" />}
                {isLoading ? "Sending..." : label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSender;
