import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "px-4 py-2 rounded bg-[#0a2342] text-white font-bold shadow-lg hover:bg-[#16335b] transition " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
