import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('flex flex-wrap gap-x-8 gap-y-1 border-b border-ink-900/15', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px border-b-2 border-transparent py-4 text-[13px] font-semibold uppercase tracking-[0.14em]',
        'text-ink-600 transition-colors hover:text-ink-900',
        'data-[state=active]:border-ink-800 data-[state=active]:text-ink-900',
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-2 focus-visible:outline-none', className)}
      {...props}
    />
  )
}
