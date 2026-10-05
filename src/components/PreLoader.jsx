import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function PreLoader({ onFinish }) {
  const overlayRef = useRef(null)
  const boxRef = useRef(null)
  const pctRef = useRef(null)
  const rectRef = useRef(null)
  const lineRef = useRef(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const rectLength = rectRef.current.getTotalLength()
    gsap.set(rectRef.current, { strokeDasharray: rectLength, strokeDashoffset: rectLength })
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' })

    const counter = { val: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.inOut',
          delay: 0.25,
          onComplete: () => {
            setHidden(true)
            onFinish?.()
          },
        })
      },
    })

    tl.to(boxRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(rectRef.current, { strokeDashoffset: 0, duration: 1.9, ease: 'power1.inOut' }, 0)
      .to(lineRef.current, { scaleX: 1, duration: 1.9, ease: 'power1.inOut' }, 0)
      .to(counter, {
        val: 100,
        duration: 1.9,
        ease: 'power1.inOut',
        onUpdate() {
          if (pctRef.current) pctRef.current.textContent = `${Math.round(counter.val)}%`
        },
      }, 0)

    return () => tl.kill()
  }, [onFinish])

  if (hidden) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-cream-50"
      role="status"
      aria-label="Loading Everixa Workforce"
    >
      <div ref={boxRef} className="flex flex-col items-center opacity-0 translate-y-2">
        <div className="relative">
          <svg width="220" height="90" viewBox="0 0 220 90" className="overflow-visible" aria-hidden="true">
            <rect
              ref={rectRef}
              x="1" y="1" width="218" height="88"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="text-ink-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display italic text-3xl font-semibold tracking-wide text-ink-700">
              EVERIXA
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative h-px w-32 overflow-hidden bg-ink-200">
            <div ref={lineRef} className="absolute inset-0 bg-ink-600" />
          </div>
          <span ref={pctRef} className="font-body text-xs tabular-nums tracking-widest text-ink-600">
            0%
          </span>
        </div>
      </div>
    </div>
  )
}
