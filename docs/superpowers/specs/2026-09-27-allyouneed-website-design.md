# Allyouneed — Marketing Website & Brand: Design Spec

- **Date:** 2026-09-27
- **Status:** Approved in brainstorming, pending written-spec review
- **Reference:** https://officegen.in/ (structure and positioning only; all copy is original)

## 1. Goal and scope

Allyouneed is an all-in-one business operating system for growing Indian businesses: HR, payroll, accounting, CRM, inventory/POS, attendance, projects, assets, reports, communications, integrations, and built-in GST/TDS/ITR/ROC filing with an on-demand CA network.

This first sub-project delivers **the brand and the marketing website only**. The product app is a later sub-project.

### In scope
- Brand kit: logo (full, mark-only, favicon, app icon; light and dark variants), color palette, typography.
- Multi-page marketing website (pages listed in §4).
- Visual-only Login and Register pages.
- Forms that validate and show success/error states without sending data anywhere.

### Out of scope (future sub-projects)
- Real authentication, backend, database, or working app modules.
- Real form delivery (email, CRM, form service).
- Payments, blog/CMS, and multi-language (Hindi, etc.).

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, static export (`output: 'export'`) |
| Styling | Tailwind CSS |
| Theming | `next-themes`, class-based dark mode, defaults to system, persists user choice, no flash on load |
| Fonts | `next/font`: Plus Jakarta Sans (headings), Inter (body) |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + `zod` |
| Animation | `motion` (Framer Motion, `motion/react`), `lenis` for smooth scroll (see §6 Motion) |
| Tests | Vitest + React Testing Library |
| Hosting | Any static host (Vercel/Netlify); no server runtime required |

## 3. Brand

### Logo: "Module grid"
- **Mark:** a 2×2 grid of rounded tiles. Top-left, top-right, and bottom-left are indigo (top-left `#534AB7`; other two `#7F77DD`). Bottom-right is amber `#EF9F27` and more rounded (circle-ish): the piece that completes the business.
- **Wordmark:** lowercase `allyouneed`, "allyou" in the primary text color and "need" in `#7F77DD`. Heading font, weight 700, slight negative letter-spacing.
- **Deliverables** in `public/brand/`: `logo.svg`, `logo-dark.svg` (wordmark adjusted for dark backgrounds), `mark.svg`, `app-icon.svg` (mark on an indigo rounded-square background), plus `app/icon.svg` / `favicon.ico` and `apple-icon.png`.
- React components `<Logo />` and `<LogoMark />` render the SVG inline so they follow the theme.

### Color tokens
Defined as CSS variables and mapped into Tailwind's theme.

| Token | Light | Dark |
|---|---|---|
| `primary` | `#534AB7` | `#7F77DD` |
| `primary-soft` | `#EEEDFE` | `#26215C` |
| `accent` (amber) | `#EF9F27` | `#FAC775` |
| `background` | `#FFFFFF` | `#0B1020` (deep navy) |
| `surface` | `#F7F7FB` | `#121833` |
| `border` | `#E5E7EB` | `#232B4D` |
| `text` | `#0F172A` | `#E7E9F5` |
| `text-muted` | `#475569` | `#A3A9C7` |

Text/background pairs must meet WCAG AA (≥4.5:1 for body text).

### Voice
Plain, confident, India-first (₹, GST, TDS, PAN, ITR, CA). Sentence-case headings. No copy is taken from officegen.in.

## 4. Information architecture

### Routes
`/`, `/features`, `/tax-compliance`, `/pricing`, `/contact`, `/about`, `/terms`, `/privacy`, `/refund`, `/login`, `/register`.

### Global layout
- **Navbar (sticky):** Logo · Features · Tax & Compliance · Pricing · About · Contact · theme toggle · "Log in" (link) · "Start free" (primary button → `/register`). Below 1024px it collapses to a hamburger that opens a slide-out drawer (focus-trapped, closes on Escape and on route change).
- **Footer:** logo and tagline; link columns Product (Features, Tax & Compliance, Pricing), Company (About, Contact), Legal (Terms, Privacy, Refund); compliance badges (DPDP Act 2023, IT Act 2000 §43A, GDPR, ISO 27001, SOC 2 Type II) shown as **"designed to align with"** statements, not claims of certification; newsletter signup (email, optional phone with +91 prefix); © year Allyouneed.

### Home (`/`)
1. **Hero:** H1 "Everything your business runs on. One OS." Subtext naming HR, payroll, accounting, CRM, inventory, and GST filing. CTAs "Start free" (→ `/register`) and "Book a demo" (→ `/contact`). `DashboardMock` in a browser frame on the right (stacks below on mobile).
2. **Trust bar:** "Trusted by 200+ growing Indian businesses", a row of fictional company wordmarks, and four count-up stats: organisations, modules, employees managed, uptime.
3. **"Not just an ERP":** enter data once and every department sees it.
4. **Module showcase:** tabs for Dashboard, Accounting, Inventory, POS Billing, CRM; each swaps its mockup and a short description.
5. **Module grid:** 12 cards (HR, Payroll, Accounting, CRM & Leads, Inventory & POS, Attendance, Tax Filing, Projects, Assets, Reports, Communications, Integrations), each linking to its anchor on `/features`.
6. **Integrations:** payment gateways, WhatsApp, Meta lead ads, Google Business, telephony, custom API, using generic lucide icons (no third-party brand logos).
7. **Mobile app:** "Run the business from your phone", two `PhoneMock`s (light and dark), placeholder store badges labelled "Coming soon".
8. **AI workflow:** "Record once. Everything else follows": Record → Sync → AI flags anomalies → Report & file.
9. **Tax teaser:** cards for GST, TDS, ITR, PF/ESI, ROC, linking to `/tax-compliance`.
10. **Company journey:** Day 0 Incorporate → Week 1 Register & set up → Every month Run & file → Year end Close the year.
11. **Employee ITR:** pre-filled return mockup with a "Filed in 4 minutes" badge.
12. **Expert help:** audits, tax notice support, advisory, a network of 200+ CAs.
13. **Testimonials:** three fictional customer cards.
14. **Final CTA:** "Run your whole business on Allyouneed" with both CTAs.

### Features (`/features`)
One section per module (the 12 above), each with an `id` anchor, a one-paragraph description, 4–6 capability bullets, and a small mockup or icon illustration. On ≥1024px a sticky side menu highlights the module currently in view.

### Tax & Compliance (`/tax-compliance`)
- Six categories with their named filings:
  - **GST:** GSTR-1, GSTR-3B, GSTR-9, e-invoicing, e-way bills, ITC reconciliation.
  - **TDS:** 24Q, 26Q, 27Q, Form 16/16A, challan payments.
  - **Income tax:** ITR-3/4/5/6, advance tax, tax audit support.
  - **Payroll contributions:** PF, ESI, Professional Tax, LWF.
  - **Company/ROC:** AOC-4, MGT-7, DIR-3 KYC, statutory registers.
  - **Registrations:** incorporation, GST, PF/ESI, IEC, MSME/Udyam.
- A compliance calendar showing sample monthly due dates (e.g. 7th TDS deposit, 11th GSTR-1, 20th GSTR-3B).
- Reuses the Company journey and Expert help sections.

### Pricing (`/pricing`)
- Monthly/yearly toggle; yearly price = monthly × 12 × 0.8, displayed as the per-month equivalent with the annual total underneath.
- Plans (placeholder values in `content/pricing.ts`):

| Plan | Monthly | Summary |
|---|---|---|
| Free | ₹0 | Up to 5 users; core accounting + CRM |
| Growth | ₹999 | Up to 25 users; all modules; GST filing (highlighted "Most popular") |
| Business | ₹2,999 | Up to 100 users; payroll + TDS; integrations |
| Enterprise | Custom | Unlimited users; SSO; dedicated CA; "Contact sales" CTA |

- Full feature-comparison table (scrolls horizontally inside its own container on mobile), FAQ accordion, final CTA.

### Contact (`/contact`)
"Book a demo" form: full name, work email, phone (+91, 10 digits), company, team size (select: 1–10, 11–50, 51–200, 201–500, 500+), modules of interest (multi-select checkboxes), message (optional). Beside it: sample email, phone, office address, office hours.

### About (`/about`)
Mission, origin story, four values, security and compliance section, final CTA.

### Legal (`/terms`, `/privacy`, `/refund`)
Shared `LegalLayout` with a table of contents and "Last updated" date. Placeholder text written with the DPDP Act 2023 in mind, with a visible notice: "Sample text: have this reviewed by a lawyer before launch."

### Login / Register
Split screen: a brand panel (logo, tagline, mini mockup) and a form. Login: email, password. Register: name, work email, phone, company, password (min 8 characters). Submitting a valid form shows "Coming soon: the Allyouneed app is launching shortly." No credentials are stored or sent anywhere.

## 5. Components and content

```
app/                    routes + layout.tsx (fonts, ThemeProvider, Navbar, Footer, metadata)
components/
  brand/                Logo, LogoMark
  layout/               Navbar, MobileNav, Footer, ThemeToggle
  ui/                   Button, Card, Badge, Input, Select, Checkbox, Textarea,
                        Section, SectionHeading, Tabs, Accordion, Container
  motion/               Reveal, Stagger, MagneticButton, TiltCard, SpotlightCard,
                        Marquee, CountUp, RollingNumber, ScrollProgress, BackToTop,
                        SmoothScroll, AuroraBackground, CursorSpotlight, AnimatedLogo
  sections/             Hero, TrustBar, ValueProp, ModuleShowcase, ModuleGrid,
                        Integrations, MobileApp, AiWorkflow, TaxTeaser,
                        JourneyTimeline, EmployeeItr, ExpertHelp, Testimonials,
                        FinalCta, PricingTable, ComparisonTable, Faq, ComplianceCalendar
  mockups/              BrowserFrame, PhoneFrame, DashboardMock, AccountingMock,
                        InventoryMock, PosMock, CrmMock, ItrMock
  forms/                ContactForm, NewsletterForm, LoginForm, RegisterForm, FormStatus
content/                site.ts, nav.ts, modules.ts, tax.ts, pricing.ts, faq.ts,
                        testimonials.ts, stats.ts, integrations.ts, legal/*.ts
lib/                    forms.ts, schemas.ts, pricing.ts, motion.ts, cn.ts
public/brand/           logo SVGs and icons
```

**Principles**
- All user-facing copy and sample data live in `content/*.ts` as typed data; components only render it.
- Mockups are pure presentational React components using fictional sample data (₹ amounts, GSTINs formatted like `27ABCDE1234F1Z5`, Indian names and cities). They scale with CSS and never overflow at 375px.
- All stats, customer names, logos, testimonials, and prices are fictional placeholders, marked in `content/` with a `// PLACEHOLDER` comment.

## 6. Behavior

### Forms
- Schemas in `lib/schemas.ts` (zod): email format; Indian mobile `^[6-9]\d{9}$`; required fields; password ≥8 characters.
- Errors appear inline below each field and are linked through `aria-describedby`; focus moves to the first invalid field when the form is submitted.
- Single transport: `submitForm(kind: 'contact' | 'newsletter' | 'login' | 'register', data): Promise<{ ok: true } | { ok: false; error: string }>` in `lib/forms.ts`. It currently waits about 800ms and resolves `{ ok: true }`; replacing its body is the only change needed to connect a real service.
- States: idle → submitting (spinner, fields disabled) → success panel, or error message with a Retry button.

### Interactivity
- Tabs and accordion follow the WAI-ARIA patterns (arrow keys, Home/End, `aria-selected`/`aria-expanded`).
- Theme toggle: system/light/dark; `next-themes` prevents a flash of the wrong theme.

### Motion and interaction design
The site has to feel alive and unmistakably Allyouneed: motion is a core part of the brand, not decoration added at the end. The module-grid logo (tiles coming together into one whole) is the recurring motif.

**Libraries:** `motion` (Framer Motion, imported from `motion/react`) for component animation, scroll-linked effects, and shared-layout transitions, loaded through `LazyMotion` + `domAnimation` to keep the bundle small. `lenis` provides smooth scrolling on desktop. No other animation libraries.

**Signature moments**
1. **Hero assembly:** on load, the three indigo logo tiles slide in from different directions and the amber tile drops in last with a small spring "click". Headline words then reveal one after another (fade, rise, blur to sharp), followed by the subtext and CTAs.
2. **Living hero background:** a slow-drifting indigo/amber aurora gradient over a faint dot grid, plus a soft spotlight that follows the cursor (desktop only).
3. **3D dashboard:** the hero `DashboardMock` tilts in perspective toward the cursor (max about 8°) with floating KPI chips at different depths ("GSTR-3B filed", "₹4.2L collected today", "12 new leads"). Chips bob gently and parallax at different rates.
4. **Live mockups:** mockups animate themselves when they come into view: chart bars grow, line charts draw, numbers tick up, and toast notifications pop in ("Invoice #1042 paid", "Payroll run complete").
5. **Logo marquee:** the trust-bar logos scroll in an endless loop, pause on hover, and fade out at the edges. Stats count up when scrolled into view.
6. **Module showcase:** the active-tab pill slides between tabs as a shared-layout element (`layoutId`); mockups swap with a crossfade and slide. It auto-advances every 6 seconds until the user interacts, with a progress bar under the active tab.
7. **Spotlight cards:** module and feature cards show a radial glow and a border highlight that follow the cursor, lift slightly with a subtle 3D tilt, and animate their icon on hover (e.g. a wiggle or a stroke draw).
8. **Scroll-drawn workflow:** in "Record once. Everything else follows", an SVG connector line draws itself as you scroll (scroll-linked `pathLength`) and each step lights up when the line reaches it.
9. **Journey timeline:** a progress line fills with scroll; each milestone dot pulses once as it activates.
10. **Phone parallax:** the light and dark `PhoneMock`s move at different speeds while scrolling and rotate slightly in opposite directions.
11. **Pricing:** the monthly/yearly switch slides a pill; prices roll to their new value digit by digit; the "Most popular" card has a slowly rotating conic-gradient border.
12. **Buttons and links:** primary CTAs are magnetic (they pull slightly toward the cursor) and a light shine sweeps across on hover; arrow icons nudge right; text links draw an underline from left to right.
13. **Navbar:** transparent at the top of the page; once you scroll it becomes a blurred glass bar and shrinks slightly. It hides when you scroll down and reappears when you scroll up. An animated indicator marks the current page.
14. **Page transitions:** routes fade and rise in through `app/template.tsx`.
15. **Theme toggle:** the sun/moon icon morphs, and the theme change spreads as a circular reveal from the toggle using the View Transitions API (plain instant switch where the API isn't supported).
16. **Scroll extras:** a thin indigo→amber reading-progress bar at the top of the page and a back-to-top button that appears after one screen of scrolling.
17. **Section reveals:** headings and content fade up with a stagger as they enter the viewport, driven by one shared `<Reveal>` component and consistent timing tokens.

**Motion tokens** (in `lib/motion.ts`): durations fast 150ms / base 300ms / slow 600ms; easing `[0.22, 1, 0.36, 1]` (ease-out-quint) for entrances and a spring (`stiffness 300, damping 24`) for interactive feedback; stagger 60–80ms.

**Rules**
- Animate only `transform`, `opacity`, `filter`, and `clip-path`; never layout properties.
- `prefers-reduced-motion: reduce` turns off all decorative and scroll-linked motion, the marquee, auto-advance, smooth scrolling, tilt, and magnetism; content renders in its final state straight away. Hover color and border changes stay.
- Touch devices (`(hover: none)`) skip the cursor spotlight, tilt, and magnetic effects.
- Content is never hidden behind an animation that might not run: if JavaScript fails, everything is still visible and readable (reveals start visible under `<noscript>` or no-JS).
- No scroll-jacking and no animation longer than 1.2s blocking interaction.

### Responsive and accessibility
- Mobile-first; breakpoints at 640/768/1024/1280px; no horizontal page scroll at 375px.
- One `h1` per page, landmark elements (`header`, `nav`, `main`, `footer`), a skip-to-content link, visible focus rings, alt text on meaningful images, decorative SVGs marked `aria-hidden`.

### SEO and performance
- Per-page `metadata` (title template "%s · Allyouneed", description), Open Graph/Twitter card image, `sitemap.xml`, `robots.txt`, `manifest.webmanifest`.
- Static HTML export; target Lighthouse ≥90 in all four categories on `/`.

## 7. Testing and verification

- **Unit (Vitest + RTL):**
  - `lib/schemas.ts`: valid and invalid emails, phones, passwords, required fields.
  - `lib/pricing.ts`: monthly and yearly calculations; Custom plans have no price.
  - `lib/forms.ts`: resolves success; form components show the submitting, success, and error states (error forced through a mocked transport).
  - Content integrity: every module has a slug, title, description, and at least 4 bullets; every pricing plan has an id, name, and features; slugs are unique.
  - Tabs/Accordion: keyboard navigation and ARIA attributes.
  - Motion: with reduced motion mocked, `<Reveal>` renders children immediately in their final state and the showcase does not auto-advance; `lib/motion.ts` exports the documented tokens.
- **Build:** `next build` (static export) passes with no type or lint errors.
- **Visual:** run the dev server in the browser pane; check every route at 1280px and 375px in light and dark themes; fix layout breaks, overflow, and contrast issues before calling the work done.
- **Motion check:** in the browser pane, confirm every signature moment in §6 fires (hero assembly, tilt, marquee, showcase auto-advance, scroll-drawn line, pricing digit roll, navbar hide/show, theme reveal), check the console for errors, and confirm nothing is left invisible with reduced motion emulated.

## 8. Risks and notes

- **Copying risk:** layout ideas are borrowed; text, logos, and illustrations must be original. No OfficeGen client logos or text are used.
- **Compliance badges** are phrased as alignment, not certification, until the business actually holds those certifications.
- **Legal pages** are placeholders and need legal review before launch.
