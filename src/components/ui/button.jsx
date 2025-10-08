import React from "react";

export const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md text-white font-semibold ${
      props.disabled
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 transition"
    } ${className}`}
  >
    {children}
  </button>
);
