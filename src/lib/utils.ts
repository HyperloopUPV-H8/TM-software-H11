import unitMap from "@/constants/unitMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts date object into formatted date string
// Example: "Tuesday, September 16, 2025 at 9:00 AM"
export function getFormattedDate(date: Date): string {
  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart} at ${timePart}`;
}

// Converts snake_case to Title Case
// Example: "battery_level" -> "Battery Level"
export const formatSnakeCaseToTitle = (str: string): string => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Converts PascalCase to Title Case
// Example: "BatteryLevel" -> "Battery Level"
export const formatPascalCaseToTitle = (str: string) => {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Handle acronyms: "XMLParser" → "XML Parser"
    .replace(/([a-z\d])([A-Z])/g, "$1 $2") // Regular PascalCase: "myVar" → "my Var"
    .replace(/^./, (char) => char.toUpperCase()) // Ensure first char is uppercase
    .trim();
};

// Use currentTime for live updates
export const formatLastUpdatedLive = (
  date: Date,
  currentTime: Date
): string => {
  const diffInSeconds = Math.floor(
    (currentTime.getTime() - date.getTime()) / 1000
  );

  if (diffInSeconds < 1) {
    return "just now";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const isISODateString = (str: string): boolean => {
  // Check if string matches ISO 8601 format
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

  if (!isoRegex.test(str)) {
    return false;
  }

  const date = new Date(str);
  return !isNaN(date.getTime());
};

// Utility function to format metric values with units
export const formatMetricValue = (
  key: string,
  value: number | string
): string => {
  if (typeof value !== "number") {
    if (isISODateString(value)) {
      return new Date(value).toLocaleString();
    }
    return value.toString();
  }

  const unit = unitMap[key] || "";
  return `${value.toFixed(2)}${unit}`;
};
