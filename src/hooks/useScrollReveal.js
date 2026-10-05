import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * useScrollReveal — one quiet fade-up per element, triggered when *that element*
 * enters the viewport (not when its whole section does), so long sections don't
 * pop in all at once. Elements already in view on load just appear in sequence.
 */
export function useScrollReveal(selector = '.reveal', options = {}) {
  const containerRef = useRef(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    if (!containerRef.current || reduceMotion()) return
    const opts = optionsRef.current
    const elements = containerRef.current.querySelectorAll(selector)
    if (!elements.length) return

    const ctx = gsap.context(() => {
      gsap.set(elements, { opacity: 0, y: opts.y ?? 28 })
      ScrollTrigger.batch(elements, {
        start: opts.start || 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: opts.duration || 0.9,
            stagger: opts.stagger ?? 0.08,
            ease: 'power3.out',
            overwrite: true,
          }),
      })
    }, containerRef)

    return () => ctx.revert()
  }, [selector])

  return containerRef
}

/** useCounterAnimation — counts numbers up once when they scroll into view. */
export function useCounterAnimation(stats) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !stats?.length || reduceMotion()) return
    const counters = containerRef.current.querySelectorAll('[data-counter]')
    if (!counters.length) return

    const ctx = gsap.context(() => {
      counters.forEach((el, i) => {
        const target = stats[i]?.value ?? 0
        const obj = { val: 0 }
        el.textContent = '0'
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate() {
            el.textContent = Math.round(obj.val).toLocaleString()
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [stats])

  return containerRef
}

// Images/fonts shift layout after first paint; keep trigger positions honest.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh())
}
