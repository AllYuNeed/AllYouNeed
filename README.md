# Allyouneed — website

Marketing site and brand kit for Allyouneed, the business OS for growing Indian companies. Next.js 16 (App Router, static export), Tailwind CSS 4, Motion.

## Scripts

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — static export to `out/` (deploy that folder to any static host)
- `npm test` / `npm run typecheck` / `npm run lint`
- `npm run brand` — re-render `public/brand/*.png` and `app/favicon.ico` from the SVGs (run after editing a brand SVG)

## Where things live

- **Copy and data:** most copy and all placeholder data live in `content/*.ts` — modules, prices, FAQs, testimonials, stats, expert services, the about story and legal paragraphs. Some section headings, leads and short bullet lists are still inline in `components/sections/*`, and the sample rows inside `components/mockups/*` are illustrative UI data. Items marked `// PLACEHOLDER` are fictional and must be replaced before launch (stats, customer names, testimonials, prices, the about story and security figures, the expert-network size, contact details and hours, the domain in `content/site.ts`).
- **Forms:** all submissions go through `lib/forms.ts → submitForm()`. It currently waits 800 ms and succeeds. To send real data, replace its body with a `fetch()` to Formspree or your API — nothing else changes.
- **Brand:** `public/brand/` (SVG sources + generated PNGs), `components/brand/`.
- **Motion:** `lib/motion.ts` (tokens) and `components/motion/` (primitives). Everything honours `prefers-reduced-motion`.
- **Legal pages:** sample text in `content/legal/`. Have a lawyer review before launch.

## Deploy

`npm run build`, then upload `out/` (Vercel, Netlify, Cloudflare Pages, S3 — anything that serves static files). Set the real domain in `content/site.ts` first so `sitemap.xml`, `robots.txt` and Open Graph URLs are correct.
