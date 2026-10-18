// Post-build SEO step (runs after `vite build`, see package.json "build").
//
// The app is a client-rendered SPA, so crawlers and link-preview bots would otherwise
// see one empty shell for every URL. This writes a real HTML file per public route with
// its own <title>, description, canonical, Open Graph / Twitter tags, JSON-LD and a
// crawlable text snapshot, then generates sitemap.xml and a noindex 404.html.
// React replaces the snapshot as soon as the app mounts.

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { jobs, services, industries, offices, serviceFaqs } from '../src/data/index.js'
import {
  DEFAULT_IMAGE, SITE_NAME, SITE_URL, notFound, publicRoutes, schemaFor,
} from '../src/seo/routes.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

const faqs = serviceFaqs.map((f) => [f.q, f.a])

/** Route-specific JSON-LD nodes. */
function extraSchema(route) {
  if (route.path === '/services') {
    return [
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'ItemList',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@type': 'Service', name: s.title, description: s.description, provider: { '@id': `${SITE_URL}/#organization` }, areaServed: 'US' },
        })),
      },
    ]
  }
  return []
}

/** Crawlable text for each route, drawn from the same data the pages render. */
function snapshot(route) {
  const nav = publicRoutes
    .map((r) => `<li><a href="${r.path}">${esc(r.heading)}</a></li>`)
    .join('')
  let body = ''
  if (route.path === '/jobs') {
    body = `<h2>Open remote roles</h2><ul>${jobs
      .map((j) => `<li><h3>${esc(j.title)}</h3><p>${esc(j.type)} · ${esc(j.wage)} · ${esc(j.location)}</p><p>${esc(j.description)}</p></li>`)
      .join('')}</ul>`
  } else if (route.path === '/services') {
    body = `<h2>Our services</h2><ul>${services.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></li>`).join('')}</ul>` +
      `<h2>Frequently asked questions</h2>${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}`
  } else if (route.path === '/industries') {
    body = `<h2>Fields we hire for</h2><ul>${industries.map((i) => `<li><h3>${esc(i.title)}</h3><p>${esc(i.description)}</p></li>`).join('')}</ul>`
  } else if (route.path === '/contact') {
    body = `<h2>Offices</h2><ul>${offices
      .map((o) => `<li>${esc(o.address)}, ${esc(o.city)}, ${esc(o.state)} ${esc(o.zip)}</li>`)
      .join('')}</ul><p>Phone: <a href="tel:+18632433789">(863) 243-3789</a> · Email: <a href="mailto:admin.everixaworkforce@gmail.com">admin.everixaworkforce@gmail.com</a></p>`
  } else if (route.path === '/') {
    body = `<h2>Popular work-from-home roles</h2><ul>${jobs
      .slice(0, 6)
      .map((j) => `<li><a href="/jobs">${esc(j.title)}</a>: ${esc(j.wage)}</li>`)
      .join('')}</ul>`
  }
  return `<main><h1>${esc(route.heading)}</h1><p>${esc(route.description)}</p>${body}<nav aria-label="Site"><ul>${nav}</ul></nav></main>`
}

function headTags(route, { canonical, noindex, ld }) {
  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`,
    canonical ? `<link rel="canonical" href="${canonical}" />` : '',
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${canonical ?? SITE_URL}" />`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_IMAGE}" />`,
    ld ? `<script id="seo-jsonld" type="application/ld+json">${json(ld)}</script>` : '',
  ].filter(Boolean).join('\n    ')
}

/** Drops the generic head tags from the template so each page carries its own. */
function stripGeneric(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="(?:description|robots)"[\s\S]*?\/>\s*/gi, '')
    .replace(/<meta\s+property="og:(?:title|description|url|image)"[\s\S]*?\/>\s*/gi, '')
    .replace(/<meta\s+name="twitter:(?:title|description|image)"[\s\S]*?\/>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>\s*/gi, '')
}

function render(route, opts, content = '') {
  let html = stripGeneric(template).replace('</head>', `  ${headTags(route, opts)}\n  </head>`)
  if (content) html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
  return html
}

function write(file, html) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

// ─── Public routes ───────────────────────────────────────────────────────────
for (const route of publicRoutes) {
  const canonical = SITE_URL + (route.path === '/' ? '/' : route.path)
  const ld = schemaFor(route, { offices, extra: extraSchema(route) })
  const html = render(route, { canonical, noindex: false, ld }, snapshot(route))
  write(route.path === '/' ? join(dist, 'index.html') : join(dist, route.path, 'index.html'), html)
}

// ─── 404 (served with a real 404 status by vercel.json) ──────────────────────
write(join(dist, '404.html'), render(notFound, { canonical: null, noindex: true, ld: null }))

// ─── sitemap.xml ─────────────────────────────────────────────────────────────
function lastmod(route) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', route.source], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    if (out) return out.slice(0, 10)
  } catch { /* shallow clone or no git: fall through */ }
  return new Date().toISOString().slice(0, 10)
}

const urls = publicRoutes.map((r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${lastmod(r)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n')

writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)

console.log(`[seo] prerendered ${publicRoutes.length} routes, 404.html and sitemap.xml for ${SITE_NAME}`)
