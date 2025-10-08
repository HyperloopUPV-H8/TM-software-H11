import React, { useState } from "react";
import WebhookDashboard from "./components/WebhookDashboard";
import WebhookSender from "./components/WebhookSender";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
  <Toaster>
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
      <WebhookDashboard />
      <WebhookSender />
    </div>
  </Toaster>
  );
}
