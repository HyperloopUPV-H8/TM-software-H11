import "./App.css";
import { Toaster } from "./components/ui/sonner";
import WebhookViewer from "./components/common/WebhookViewer";
import WebhookSender from "./components/common/WebhookSender";
import { useWebhookConnection } from "./hooks/useWebSocketConnection";
import { useEffect, useState } from "react";

const toastConfig = {
  position: "bottom-center" as const,
  duration: 3000,
  richColors: true,
  closeButton: true,
};

function App() {
  const { connectionStatus, lastMetrics, disconnect, connect, sendCommand } =
    useWebhookConnection();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <header className="flex items-center justify-center gap-10 w-full p-5 px-10">
          <h1 className="text-3xl font-bold text-black my-2 text-center">
            Training Month - Hyperloop H11
          </h1>
        </header>

        <main className="w-full flex justify-center flex-1 items-start">
          <WebhookViewer lastMetrics={lastMetrics} currentTime={currentTime} />
          <WebhookSender
            connectionStatus={connectionStatus}
            disconnect={disconnect}
            connect={connect}
            sendCommand={sendCommand}
          />
        </main>
      </div>

      <Toaster
        {...toastConfig}
        toastOptions={{
          style: {
            textAlign: "left",
          },
        }}
      />
    </>
  );
}

export default App;
