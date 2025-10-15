import { toast } from "sonner";
import { getFormattedDate } from "@/lib/utils";
import { TOAST_MESSAGES, TOAST_DESCRIPTIONS } from "@/constants/messages";
import type Command from "@/types/Command";

function showNewMessage() {
  toast.info(TOAST_MESSAGES.NEW_MESSAGE, {
    description: getFormattedDate(new Date()),
  });
}

function showConnected() {
  toast.success(TOAST_MESSAGES.CONNECTED, {
    description: TOAST_DESCRIPTIONS.CONNECTED,
  });
}

function showDisconnected() {
  toast.warning(TOAST_MESSAGES.DISCONNECTED, {
    description: TOAST_DESCRIPTIONS.DISCONNECTED,
  });
}

function showConnecting(promise: Promise<void>) {
  toast.promise(promise, {
    loading: TOAST_MESSAGES.CONNECTING,
    success: () => {
      return TOAST_MESSAGES.CONNECTED;
    },
    error: TOAST_MESSAGES.ERROR,
  });
}

function showDisconnecting(promise: Promise<void>) {
  toast.promise(promise, {
    loading: TOAST_MESSAGES.DISCONNECTING,
    success: () => {
      return TOAST_MESSAGES.DISCONNECTED;
    },
    error: TOAST_MESSAGES.ERROR,
  });
}

function showError() {
  toast.error(TOAST_MESSAGES.ERROR, {
    description: TOAST_DESCRIPTIONS.ERROR_CONNECTING,
  });
}

function showTextSuccess(text: string) {
  toast.success(TOAST_MESSAGES.SUCCESS, {
    description: text,
  });
}

function showCommandResult(command: Command) {
  toast.success(TOAST_MESSAGES.SUCCESS, {
    description: `${TOAST_MESSAGES.SUCCESS} ${command.action}${
      command.params ? ` ${JSON.stringify(command.params)}` : ""
    }`,
  });
}

function showTextError(text: string) {
  toast.error(TOAST_MESSAGES.ERROR, {
    description: text,
  });
}

function showMessagesCleared() {
  toast.success(TOAST_MESSAGES.MESSAGES_CLEARED, {
    description: TOAST_DESCRIPTIONS.MESSAGES_CLEARED,
  });
}

export const ToastNotifications = {
  showNewMessage,
  showConnected,
  showDisconnected,
  showConnecting,
  showDisconnecting,
  showError,
  showMessagesCleared,
  showTextSuccess,
  showTextError,
  showCommandResult,
};
