import "./App.css";
import { Toaster } from "./components/ui/sonner";
import WebhookViewer from "./pages/WebhookViewer";
import { Link, Route, Routes } from "react-router-dom";
import WebhookSender from "./pages/WebhookSender";

const toastConfig = {
  position: "bottom-center" as const,
  duration: 3000,
  richColors: true,
  closeButton: true,
};

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <header className="flex flex-col items-center absolute top-0 m-2 p-4">
          <h1 className="text-3xl font-bold text-black my-2">
            Training Month - Hyperloop H11
          </h1>

          <nav className="flex gap-4">
            <Link to="/viewer">Webhook Viewer</Link>
            <Link to="/sender">Webhook Sender</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/viewer" element={<WebhookViewer />} />
            <Route path="/sender" element={<WebhookSender />} />
          </Routes>
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
