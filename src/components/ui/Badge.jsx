import { cn } from '../../lib/utils'

const variants = {
  default:  'bg-ink-100 text-ink-800',
  success:  'bg-ink-100 text-ink-800',
  warning:  'bg-brass-300/30 text-brass-700',
  outline:  'border border-ink-300 text-ink-700',
  dark:     'bg-ink-800 text-cream-100',
}

export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium font-body',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
