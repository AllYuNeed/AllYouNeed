# Allyouneed — website

Marketing site and brand kit for Allyouneed, the business OS for growing Indian companies. Next.js 16 (App Router, static export), Tailwind CSS 4, Motion.

## Scripts

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — static export to `out/` (deploy that folder to any static host)
- `npm test` / `npm run typecheck` / `npm run lint` (on a low-memory machine: `npx vitest run --no-file-parallelism`)
- `npm run brand` — re-render `public/brand/*.png` and `app/favicon.ico` from the SVGs (run after editing a brand SVG)

## Where things live

- **Copy and data:** most copy and all placeholder data live in `content/*.ts` — modules, prices, FAQs, testimonials, stats, expert services, the about story and legal paragraphs. Some section headings, leads and short bullet lists are still inline in `components/sections/*`, and the sample rows inside `components/mockups/*` are illustrative UI data. Items marked `// PLACEHOLDER` are fictional and must be replaced before launch (stats, customer names, testimonials, prices, the about story and security figures, the expert-network size, contact details and hours, the domain in `content/site.ts`).
- **Accounts and data (Supabase):** sign-up, log in, log out, password reset and the protected `/account/` page use Supabase Auth from the browser (`lib/auth/`, `lib/supabase/`). The contact and newsletter forms go through `lib/forms.ts → submitForm()`, which writes to Supabase (`lib/supabase/formTransport.ts`). The schema and access rules are in `supabase/migrations/`. **Setup, environment variables and the test checklist: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).** With no Supabase settings the site still builds and runs; account features and forms then say plainly that they aren't connected.
- **Brand:** `public/brand/` (SVG sources + generated PNGs), `components/brand/`.
- **Motion:** `lib/motion.ts` (tokens) and `components/motion/` (primitives). Everything honours `prefers-reduced-motion`.
- **Legal pages:** sample text in `content/legal/`. Have a lawyer review before launch.

## Configuration

Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both public). Never put a secret or service-role key in a `NEXT_PUBLIC_` variable; the app refuses to use one. Where to find the values and how to apply the database migration: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Deploy

Set the two variables in your host's **build** environment (they are baked in at build time), run `npm run build`, then upload `out/` (Vercel, Netlify, Cloudflare Pages, S3 — anything that serves static files). Set the real domain in `content/site.ts` first so `sitemap.xml`, `robots.txt` and Open Graph URLs are correct, and add your live `/auth/callback/` URL to Supabase's Redirect URLs. The full checklist is in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
