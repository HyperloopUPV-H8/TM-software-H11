import { Button } from "./components/ui/button";
import React, { useState } from "react";
import SignupModal from "./components/SignupModal";
import WebhookViewer from "./components/WebhookViewer";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
  <div className="flex flex-col items-center justify-center min-h-screen w-full gap-8">
    <div className="flex flex-col items-center gap-2">
      <img
        src="/logo.png"
        alt="logo"
        className="w-4 h-4 object-contain"
        style={{ width: "10rem", height: "10rem" }}
      />
      <h1 className="font-bold text-center px-4" style={{ fontSize: '3rem'}}>Hyperloop UPV</h1>
    </div>
  <div className="flex flex-col items-center gap-3">
      <h3 className="text-lg text-center px-4">Would you like to be member?</h3>
      <Button onClick={() => setModalOpen(true)}>SIGN UP</Button>
  <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
  <WebhookViewer />
    </div>
  </div>
  );
}
