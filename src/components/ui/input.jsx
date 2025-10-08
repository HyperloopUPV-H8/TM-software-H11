import React from "react";

export const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`border border-gray-400 rounded-md px-3 py-2 w-full ${className}`}
  />
);
