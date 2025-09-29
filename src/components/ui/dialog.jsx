import * as React from "react"
import { Dialog as RadixDialog, DialogTrigger as RadixDialogTrigger, DialogContent as RadixDialogContent, DialogClose as RadixDialogClose } from "@radix-ui/react-dialog"

export function Dialog({ open, onOpenChange, children }) {
  return (
    <RadixDialog open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog>
  )
}

export function DialogTrigger({ children }) {
  return <RadixDialogTrigger asChild>{children}</RadixDialogTrigger>
}

export function DialogContent({ children, className }) {
  return (
    <RadixDialogContent className={className}>
      {children}
      <RadixDialogClose />
    </RadixDialogContent>
  )
}
