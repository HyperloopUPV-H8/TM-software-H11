import React from "react";
import { ToastProvider } from "./use-toast";

export const Toaster = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};
