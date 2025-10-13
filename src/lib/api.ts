import { API_URL } from "@/constants/urls";

export type Command = string;

export type CommandResponse = {
  status: string;
  command: string;
};

export async function sendCommand(
  command: Command,
  opts?: { signal?: AbortSignal }
): Promise<CommandResponse> {
  const res = await fetch(`${API_URL}/api/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
    signal: opts?.signal,
  });

  // Attempt to parse JSON even on non-2xx for better messages
  const text = await res.text();
  const data = text ? safeJson(text) : {};

  if (!res.ok) {
    const msg =
      (data && (data.message || data.status)) ||
      `Request failed with ${res.status}`;
    throw new Error(msg);
  }

  return data as CommandResponse;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
