import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DEFAULT_IMAGE, SITE_NAME, SITE_URL, schemaFor, seoFor } from '../seo/routes'
import { offices } from '../data'

function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

const meta = (key, value, content) =>
  upsert(`meta[${key}="${value}"]`, () => document.createElement('meta'), { [key]: value, content })

/** Keeps <head> (title, description, canonical, robots, social, JSON-LD) in step with the route. */
export default function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = seoFor(pathname)
    document.title = seo.title

    meta('name', 'description', seo.description)
    meta('name', 'robots', seo.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

    const canonical = document.head.querySelector('link[rel="canonical"]')
    if (seo.canonical) {
      upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), { href: seo.canonical })
    } else canonical?.remove()

    const url = seo.canonical ?? SITE_URL + pathname
    meta('property', 'og:title', seo.title)
    meta('property', 'og:description', seo.description)
    meta('property', 'og:url', url)
    meta('property', 'og:image', DEFAULT_IMAGE)
    meta('property', 'og:site_name', SITE_NAME)
    meta('name', 'twitter:title', seo.title)
    meta('name', 'twitter:description', seo.description)
    meta('name', 'twitter:image', DEFAULT_IMAGE)

    const ld = document.getElementById('seo-jsonld')
    if (seo.noindex) ld?.remove()
    else {
      const el = ld ?? Object.assign(document.createElement('script'), { id: 'seo-jsonld', type: 'application/ld+json' })
      el.textContent = JSON.stringify(schemaFor(seo, { offices }))
      if (!ld) document.head.appendChild(el)
    }
  }, [pathname])

  return null
}
