import type { Action } from "@/types/Action";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export type CommandParam = {
  name: string;
  label: string;
  type: "number" | "string";
  defaultValue?: string | number;
};

export type CommandItem = {
  label: string;
  action: Action;
  params?: CommandParam[];
  fixedParams?: Record<string, string | number>;
  classname?: string;
  variant?: ButtonVariant;
};

export const COMMANDS: readonly CommandItem[] = [
  {
    label: "Start",
    action: "start",
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Stop",
    action: "stop",
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Accelerate",
    action: "accelerate",
    params: [
      {
        name: "acceleration",
        label: "Acceleration",
        type: "number",
        defaultValue: 10,
      },
    ],
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Mode Eco",
    action: "mode",
    fixedParams: { mode: "eco" },
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Mode Normal",
    action: "mode",
    fixedParams: { mode: "normal" },
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Mode Sport",
    action: "mode",
    fixedParams: { mode: "sport" },
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
];

// Group commands by category
export const COMMAND_GROUPS = [
  {
    title: "Basic Controls",
    description: "Start and stop operations",
    commands: COMMANDS.filter((cmd) => ["start", "stop"].includes(cmd.action)),
    defaultOpen: true,
  },
  {
    title: "Motion Controls",
    description: "Control acceleration and movement",
    commands: COMMANDS.filter((cmd) => cmd.action === "accelerate"),
    defaultOpen: true,
  },
  {
    title: "Mode Selection",
    description: "Switch between operating modes",
    commands: COMMANDS.filter((cmd) => cmd.action === "mode"),
    defaultOpen: false,
  },
] as const;
