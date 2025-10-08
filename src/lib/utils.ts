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

// Utility function to format metric values with units
export const formatMetricValue = (key: string, value: number): string => {
  const unitMap: Record<string, string> = {
    battery_level: "%",
    temperature: " \u00B0C",
    humidity: "%",
    signal_strength: " dBm",
  };

  const unit = unitMap[key] || "";
  return `${value.toFixed(2)}${unit}`;
};
