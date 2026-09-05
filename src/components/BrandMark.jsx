import { Leaf } from 'lucide-react'
import { cn } from '../lib/utils'

export default function BrandMark({ variant = 'dark', className }) {
  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 border px-3 py-1.5 transition-colors',
        isDark
          ? 'border-cream-100/50 hover:border-gold-400'
          : 'border-forest-300 hover:border-gold-500',
        className
      )}
    >
      <div className="w-5 h-5 bg-gold-500 flex items-center justify-center rounded-sm shrink-0">
        <Leaf size={11} className="text-forest-950" />
      </div>
      <span
        className={cn(
          'font-display italic text-lg font-semibold tracking-wide whitespace-nowrap',
          isDark ? 'text-cream-100' : 'text-forest-900'
        )}
      >
        Everixa <span className="text-gold-400 not-italic font-normal">Workforce</span>
      </span>
      <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t border-r border-gold-400 pointer-events-none" />
      <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-b border-l border-gold-400 pointer-events-none" />
    </div>
  )
}
