import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'

/** Password field with a show/hide (eye) button. Pass `icon` for a leading icon. */
export default function PasswordInput({ id, icon: Icon, className, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />}
      <input id={id} type={show ? 'text' : 'password'} className={cn('field pr-12', Icon && 'pl-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink-500 transition-colors hover:text-ink-900"
      >
        {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  )
}
