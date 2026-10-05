import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Sheet       = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose   = DialogPrimitive.Close

export function SheetPortal({ children }) {
  return <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
}

export function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

export function SheetContent({ className, children, side = 'right', ...props }) {
  const sides = {
    right:  'right-0 top-0 h-full w-4/5 max-w-sm data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    left:   'left-0 top-0 h-full w-4/5 max-w-sm data-[state=open]:slide-in-from-left  data-[state=closed]:slide-out-to-left',
    top:    'top-0 w-full data-[state=open]:slide-in-from-top   data-[state=closed]:slide-out-to-top',
    bottom: 'bottom-0 w-full data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 bg-white shadow-xl',
          'transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:duration-300 data-[state=open]:duration-500',
          sides[side],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 p-1 text-ink-500 hover:text-ink-900 transition-colors focus-visible:outline-brass-600">
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

export function SheetHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-2 p-6 pb-4', className)} {...props} />
}

export function SheetTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-xl font-semibold text-ink-900', className)}
      {...props}
    />
  )
}
