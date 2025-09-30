import * as React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={
        "rounded-xl border bg-white text-black shadow-sm " + className
      }
      {...props}
    >
      {children}
    </div>
  );
}
