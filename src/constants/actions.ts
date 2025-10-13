import type { Action } from "@/types/Action";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export type ActionItem = {
  label: string;
  action: Action;
  classname?: string;
  variant?: ButtonVariant;
};

export const ACTIONS: readonly ActionItem[] = [
  {
    label: "Launch",
    action: "launch",
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Detain",
    action: "detain",
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  {
    label: "Reset",
    action: "reset",
    classname:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  { label: "Error", action: "error", variant: "destructive" },
];
