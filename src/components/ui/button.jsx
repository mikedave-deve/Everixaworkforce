import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-500 transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 font-body",
  {
    variants: {
      variant: {
        default: "bg-ink-800 text-cream-100 hover:bg-ink-700",
        gold: "bg-brass-400 text-ink-950 hover:bg-brass-300",
        outline: "border border-ink-800 text-ink-800 hover:bg-ink-800 hover:text-cream-100",
        ghost: "hover:bg-cream-200 text-ink-800",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-4 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
