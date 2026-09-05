import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

export default function PageHeaderImage({ label, title, highlight, subtitle, image, cta, ctaHref = '/contact' }) {
  const titleRef = useRef(null)
  const subRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [titleRef.current, subRef.current],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover animate-ken-burns"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/85 to-forest-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent" />
      </div>

      <div className="relative container-base">
        <p className="section-label text-forest-400 mb-3">{label}</p>
        <h1 ref={titleRef} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-2xl mb-6 opacity-0">
          {title}{highlight && <span className="text-forest-400"> {highlight}</span>}
        </h1>
        {subtitle && (
          <p ref={subRef} className="font-body text-base md:text-lg text-cream-200/60 max-w-xl leading-relaxed opacity-0">
            {subtitle}
          </p>
        )}
        {cta && (
          <Link to={ctaHref} className="btn-primary bg-forest-500 hover:bg-forest-400 text-white mt-8 inline-flex">
            {cta}
          </Link>
        )}
      </div>
    </div>
  )
}
