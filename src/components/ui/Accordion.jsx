import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-ink-900/15', className)}
      {...props}
    />
  )
}

export function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-6 py-6 text-left font-display text-[1.35rem] leading-snug text-ink-900',
          'transition-colors hover:text-ink-600',
          className
        )}
        {...props}
      >
        {children}
        <Plus className="h-5 w-5 shrink-0 text-ink-500 transition-transform duration-300 group-data-[state=open]:rotate-45" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden text-[15px] leading-relaxed text-ink-700/85',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div className="max-w-xl pb-7 pr-10">{children}</div>
    </AccordionPrimitive.Content>
  )
}
