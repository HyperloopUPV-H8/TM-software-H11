export const valueChangedAnimation = [
  {
    backgroundColor: "color-mix(in srgb, var(--primary) 30%, transparent 70%)",
    transform: "scale(1.02)",
    boxShadow: "0 0 0 0 var(--primary)",
  },
  {
    backgroundColor: "color-mix(in srgb, var(--primary) 50%, transparent 50%)",
    transform: "scale(1.01)",
    boxShadow: "0 0 8px var(--primary)",
  },
  {
    backgroundColor: "var(--card)",
    transform: "scale(1)",
    boxShadow: "0 0 0 0 transparent",
  },
];

export const valueIncreaseAnimation = [
  { color: "rgb(34, 197, 94)" },
  { color: "rgb(22, 163, 74)" },
  { color: "rgb(17, 24, 39)" },
];

export const valueDecreaseAnimation = [
  { color: "rgb(239, 68, 68)" },
  { color: "rgb(220, 38, 38)" },
  { color: "rgb(17, 24, 39)" },
];
