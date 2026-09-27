# Allyouneed Website & Brand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Allyouneed brand kit and a statically exported, heavily animated Next.js marketing website (11 routes) for an all-in-one Indian business OS, with visual-only login/register and UI-only forms.

**Architecture:** Next.js 16 App Router with `output: 'export'`; all copy lives as typed data in `content/*.ts` and components only render it. A shared motion layer (`components/motion/*` + `lib/motion.ts`) built on `motion` (Framer Motion) provides every animation primitive; sections compose primitives + mockups. Forms funnel through one `submitForm()` transport stub.

**Tech Stack:** Next.js 16.3.6, React 19.2, TypeScript 5, Tailwind CSS 4 (CSS-first `@theme`), `motion` 13 (`motion/react`, `LazyMotion` + `domMax`), `lenis` 1.3, `next-themes` 0.4, `lucide-react`, `react-hook-form` 7 + `zod` 4 + `@hookform/resolvers`, Vitest 5 + Testing Library + jsdom, `@resvg/resvg-js` (build-time PNG rendering).

**Spec:** `docs/superpowers/specs/2026-09-27-allyouneed-website-design.md`

## Global Constraints

- **Node/npm:** Node 24.19 LTS is installed at `C:\Program Files\nodejs`. In PowerShell, if `node` is "not recognized", first run: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`. In Bash: `export PATH="/c/Program Files/nodejs:$PATH"`.
- **Network is flaky (ECONNRESET during installs):** the project `.npmrc` (Task 1) sets `fetch-retries=6`. If an install still fails, simply re-run the same command.
- **Project root:** `C:\Users\dgupta200\Documents\Claude\AllYouNeed` (already a git repo on `main` with `docs/` committed). The directory name has capitals, so `create-next-app` cannot be run in it — Task 1 writes the scaffold files by hand (their exact contents were verified against `create-next-app@16.3.6`).
- **Static export only:** `next.config.ts` has `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }`. Every metadata route (`sitemap.ts`, `robots.ts`, `manifest.ts`) MUST include `export const dynamic = "force-static";` or the build fails.
- **Motion library:** import components as `import { m, LazyMotion, domMax, MotionConfig, AnimatePresence } from "motion/react"` and hooks from the same module. Never import `motion.*` components (use `m.*`; `LazyMotion strict` will throw otherwise). `domMax` is required because `layoutId` shared-layout animations are used.
- **Reduced motion:** every decorative/scroll-linked animation must check `useReducedMotion()` from `motion/react` and render the final state immediately when it returns `true`. Marquee, autoplay, tilt, magnetism, cursor spotlight and smooth scroll are disabled under reduced motion; hover color/border changes stay.
- **Touch:** tilt, magnetism and cursor spotlight are disabled when `window.matchMedia("(hover: none)").matches` is true.
- **Animate only** `transform`, `opacity`, `filter`, `clip-path`. Never animate layout properties (width/height/top/left/margin).
- **No synchronous `setState` inside a `useEffect` body** — `react-hooks/set-state-in-effect` is an *error* in `eslint-config-next` 16. For media-query or "mounted" detection use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`; setting state from timers, observers, motion-value callbacks and event handlers is fine. Never add `eslint-disable` comments — if a rule fires, fix the code or report it.
- **No-JS visibility:** every element that starts hidden for an entrance animation carries `data-reveal`; `app/layout.tsx` includes a `<noscript>` style forcing `[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`.
- **Copy:** original text only — never copy text, logos or client names from officegen.in. Compliance badges are phrased "designed to align with", never "certified". Every fictional stat/customer/price sits in `content/` next to a `// PLACEHOLDER` comment.
- **Color tokens** (CSS vars in `app/globals.css`, exact values): light `--primary #534AB7`, `--primary-soft #EEEDFE`, `--accent #EF9F27`, `--background #FFFFFF`, `--surface #F7F7FB`, `--border #E5E7EB`, `--text #0F172A`, `--text-muted #475569`; dark `--primary #7F77DD`, `--primary-soft #26215C`, `--accent #FAC775`, `--background #0B1020`, `--surface #121833`, `--border #232B4D`, `--text #E7E9F5`, `--text-muted #A3A9C7`.
- **Motion tokens** (`lib/motion.ts`): durations fast 0.15s / base 0.3s / slow 0.6s; ease `[0.22, 1, 0.36, 1]`; spring `{ type: "spring", stiffness: 300, damping: 24 }`; stagger 0.06–0.08s.
- **Tests:** Vitest with jsdom. Import `test/expect/vi/describe` explicitly from `"vitest"` in every test file (globals are off so `tsc` passes). Test files live in `tests/` mirroring source paths. Run a single file with `npx vitest run tests/path/file.test.tsx`.
- **Quality gates for every task:** `npm test` passes, `npm run typecheck` passes, `npm run lint` passes. Task 19 additionally requires `npm run build`.
- **Commits:** end every commit message with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Commit after each task (multi-line messages: use `git commit -F <file>` or PowerShell `@' ... '@` here-strings; in Bash a plain `-m "$(printf '...')"` works).
- **Placeholders that are intentional and allowed:** the public domain `https://allyouneed.in`, contact details, stats, testimonials, prices. Nothing else may be left as TODO.

## File Structure

```
.npmrc, package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs, vitest.config.mts, .gitignore
app/
  layout.tsx            fonts, Providers, skip link, noscript reveal fix, Navbar/Footer, ScrollProgress, BackToTop, metadata base
  template.tsx          route fade/rise transition
  providers.tsx         ThemeProvider + MotionProvider + SmoothScroll
  globals.css           tokens, @theme inline, dark variant, keyframes, view-transition + utility classes
  page.tsx              Home: composes 14 sections
  not-found.tsx
  icon.svg              favicon (mark)
  sitemap.ts robots.ts manifest.ts   (force-static)
  features/page.tsx  tax-compliance/page.tsx  pricing/page.tsx  contact/page.tsx  about/page.tsx
  terms/page.tsx  privacy/page.tsx  refund/page.tsx
  login/page.tsx  register/page.tsx
components/
  brand/       LogoMark.tsx Logo.tsx AnimatedLogo.tsx
  layout/      Navbar.tsx MobileNav.tsx Footer.tsx ThemeToggle.tsx
  ui/          Container.tsx Section.tsx SectionHeading.tsx Button.tsx Card.tsx Badge.tsx
               Input.tsx Select.tsx Checkbox.tsx Textarea.tsx Field.tsx Tabs.tsx Accordion.tsx
  motion/      MotionProvider.tsx SmoothScroll.tsx Reveal.tsx Stagger.tsx CountUp.tsx RollingNumber.tsx
               Marquee.tsx TiltCard.tsx SpotlightCard.tsx MagneticButton.tsx ScrollProgress.tsx
               BackToTop.tsx AuroraBackground.tsx CursorSpotlight.tsx SplitWords.tsx
  mockups/     BrowserFrame.tsx PhoneFrame.tsx DashboardMock.tsx AccountingMock.tsx InventoryMock.tsx
               PosMock.tsx CrmMock.tsx ItrMock.tsx Toasts.tsx
  sections/    Hero.tsx TrustBar.tsx ValueProp.tsx ModuleShowcase.tsx ModuleGrid.tsx Integrations.tsx
               MobileApp.tsx AiWorkflow.tsx TaxTeaser.tsx JourneyTimeline.tsx EmployeeItr.tsx
               ExpertHelp.tsx Testimonials.tsx FinalCta.tsx PricingTable.tsx ComparisonTable.tsx
               Faq.tsx ComplianceCalendar.tsx FeatureDetail.tsx LegalLayout.tsx AuthLayout.tsx
  forms/       FormStatus.tsx ContactForm.tsx NewsletterForm.tsx LoginForm.tsx RegisterForm.tsx
content/       site.ts nav.ts modules.ts stats.ts integrations.ts testimonials.ts tax.ts pricing.ts
               faq.ts workflow.ts journey.ts about.ts legal/terms.ts legal/privacy.ts legal/refund.ts
lib/           cn.ts motion.ts schemas.ts pricing.ts forms.ts
scripts/       render-brand.mjs   (SVG -> PNG for og/apple/manifest icons)
public/brand/  logo.svg logo-dark.svg mark.svg app-icon.svg og.svg + generated og.png apple-icon.png icon-192.png icon-512.png
tests/         setup.ts + mirrors of the above
```

---

### Task 1: Project scaffold, dependencies, test harness

**Files:**
- Create: `.npmrc`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.mts`, `.gitignore`, `app/globals.css` (temporary), `app/layout.tsx` (temporary), `app/page.tsx` (temporary), `tests/setup.ts`, `tests/smoke.test.tsx`
- Modify: none

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `lint`, `test`, `test:watch`, `typecheck`, `brand`; path alias `@/*` → project root; Vitest with jsdom + jest-dom matchers + `next/navigation` mock + `IntersectionObserver`/`ResizeObserver`/`matchMedia` stubs.

- [ ] **Step 1: Write `.npmrc` and `package.json`**

`.npmrc`:
```
fetch-retries=6
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
audit=false
fund=false
```

`package.json`:
```json
{
  "name": "allyouneed-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "brand": "node scripts/render-brand.mjs"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.9.1",
    "clsx": "^2.1.1",
    "lenis": "^1.3.26",
    "lucide-react": "^1.48.0",
    "motion": "^13.4.4",
    "next": "16.3.6",
    "next-themes": "^0.4.6",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "react-hook-form": "^7.89.0",
    "tailwind-merge": "^3.7.0",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "@resvg/resvg-js": "^2",
    "@tailwindcss/postcss": "^4",
    "@testing-library/dom": "^10.4.2",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.7",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^9",
    "eslint-config-next": "16.3.6",
    "jsdom": "^30.1.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^5.0.2"
  }
}
```

- [ ] **Step 2: Write TypeScript, Next, PostCSS, ESLint, Vitest configs and .gitignore**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules", "out"]
}
```

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

`postcss.config.mjs`:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`eslint.config.mjs`:
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

`vitest.config.mts` (Vite 8 resolves tsconfig `paths` natively — no `vite-tsconfig-paths` plugin, so drop that devDependency too):
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
    // Mirror next.config.ts trailingSlash: true — Next's <Link> reads this at runtime.
    env: { __NEXT_TRAILING_SLASH: "true" },
  },
});
```

`.gitignore`:
```
/node_modules
/.next/
/out/
/build
/coverage
.DS_Store
*.pem
npm-debug.log*
.env*
.vercel
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 3: Write the test setup with browser API stubs**

`tests/setup.ts` (Vitest `globals` is off, so Testing Library's automatic per-test `cleanup` does not register itself — we register it here):
```ts
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

afterEach(cleanup);

// next/navigation needs an App Router context; stub what components use.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// next/font/google cannot run in jsdom; return stable class/variable names.
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-jakarta", className: "font-jakarta" }),
}));

// lenis touches window APIs jsdom lacks; render children only.
vi.mock("lenis/react", () => ({
  ReactLenis: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useLenis: () => null,
}));

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", { writable: true, value: RO });

// matchMedia: reduced motion off, hover available, by default.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();
```

- [ ] **Step 4: Write temporary app files so the build has something to render**

`app/globals.css` (replaced fully in Task 2):
```css
@import "tailwindcss";
```

`app/layout.tsx` (replaced fully in Task 2):
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allyouneed",
  description: "Everything your business runs on. One OS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx` (replaced in Task 11):
```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Allyouneed</h1>
    </main>
  );
}
```

- [ ] **Step 5: Write the failing smoke test**

`tests/smoke.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("home page renders the brand heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/allyouneed/i);
});
```

- [ ] **Step 6: Install dependencies**

Run (PowerShell, after refreshing `$env:Path` as described in Global Constraints):
```bash
npm install
```
Expected: "added N packages" with no `npm error`. `npm warn allow-scripts` lines are harmless. If it ends with `ECONNRESET`, run `npm install` again.

- [ ] **Step 7: Run the smoke test, typecheck and lint**

Run: `npm test`
Expected: `Tests 1 passed (1)`.

Run: `npm run typecheck`
Expected: no output (exit 0). Note: `next-env.d.ts` is created by the first `next build`/`next dev`; if `tsc` complains it is missing, run `npx next build` once first.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 8: Verify the static build**

Run: `npx next build`
Expected: "Compiled successfully", route table shows `○ /` and `○ /_not-found`, and an `out/index.html` file exists.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 static site with Tailwind 4, Vitest and motion deps" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Design tokens, global styles, fonts, providers, `lib/cn` and `lib/motion`

**Files:**
- Create: `lib/cn.ts`, `lib/motion.ts`, `components/motion/MotionProvider.tsx`, `components/motion/SmoothScroll.tsx`, `app/providers.tsx`, `tests/lib/motion.test.ts`, `tests/lib/cn.test.ts`
- Modify: `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string`; `lib/motion.ts` exports `duration`, `ease`, `spring`, `stagger`, `viewport`, `fadeUp`, `fadeIn`, `scaleIn`, `staggerContainer(gap?: number)`; Tailwind utilities `bg-background text-text text-text-muted bg-surface border-border bg-primary text-primary bg-primary-soft bg-accent text-accent font-display font-sans`, CSS classes `.glass`, `.text-gradient`, `.dot-grid`, `.conic-border`; `<Providers>` wraps children with theme + motion + smooth scroll.

- [ ] **Step 1: Write failing tests for `cn` and motion tokens**

`tests/lib/cn.test.ts`:
```ts
import { test, expect } from "vitest";
import { cn } from "@/lib/cn";

test("merges conditional classes and resolves tailwind conflicts", () => {
  expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
});
```

`tests/lib/motion.test.ts`:
```ts
import { test, expect } from "vitest";
import { duration, ease, spring, stagger, viewport, fadeUp, staggerContainer } from "@/lib/motion";

test("exposes the documented motion tokens", () => {
  expect(duration).toEqual({ fast: 0.15, base: 0.3, slow: 0.6 });
  expect(ease).toEqual([0.22, 1, 0.36, 1]);
  expect(spring).toEqual({ type: "spring", stiffness: 300, damping: 24 });
  expect(stagger.sm).toBe(0.06);
  expect(stagger.md).toBe(0.08);
  expect(viewport).toEqual({ once: true, margin: "-10% 0px" });
});

test("fadeUp animates only opacity and transform", () => {
  expect(Object.keys(fadeUp.hidden).sort()).toEqual(["opacity", "y"]);
  expect(fadeUp.show.transition.duration).toBe(0.6);
});

test("staggerContainer uses the given gap", () => {
  expect(staggerContainer(0.1).show.transition.staggerChildren).toBe(0.1);
  expect(staggerContainer().show.transition.staggerChildren).toBe(0.08);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib`
Expected: FAIL — cannot resolve `@/lib/cn` and `@/lib/motion`.

- [ ] **Step 3: Implement `lib/cn.ts` and `lib/motion.ts`**

`lib/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`lib/motion.ts`:
```ts
export const duration = { fast: 0.15, base: 0.3, slow: 0.6 } as const;

export const ease = [0.22, 1, 0.36, 1] as const;

export const spring = { type: "spring", stiffness: 300, damping: 24 } as const;

export const stagger = { sm: 0.06, md: 0.08 } as const;

export const viewport = { once: true, margin: "-10% 0px" } as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease } },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease } },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease } },
} as const;

export function staggerContainer(gap: number = stagger.md) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib`
Expected: 4 tests pass.

- [ ] **Step 5: Write the full `app/globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --primary: #534ab7;
  --primary-soft: #eeedfe;
  --accent: #ef9f27;
  --background: #ffffff;
  --surface: #f7f7fb;
  --border: #e5e7eb;
  --text: #0f172a;
  --text-muted: #475569;
  --glass: rgba(255, 255, 255, 0.72);
  --shadow-color: 15 23 42;
  color-scheme: light;
}

.dark {
  --primary: #7f77dd;
  --primary-soft: #26215c;
  --accent: #fac775;
  --background: #0b1020;
  --surface: #121833;
  --border: #232b4d;
  --text: #e7e9f5;
  --text-muted: #a3a9c7;
  --glass: rgba(11, 16, 32, 0.72);
  --shadow-color: 0 0 0;
  color-scheme: dark;
}

@theme inline {
  --color-primary: var(--primary);
  --color-primary-soft: var(--primary-soft);
  --color-accent: var(--accent);
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-jakarta), var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --shadow-soft: 0 1px 2px rgb(var(--shadow-color) / 0.06), 0 12px 32px -12px rgb(var(--shadow-color) / 0.18);
  --shadow-lift: 0 2px 4px rgb(var(--shadow-color) / 0.08), 0 24px 48px -16px rgb(var(--shadow-color) / 0.28);

  --animate-marquee: marquee 40s linear infinite;
  --animate-aurora: aurora 18s ease-in-out infinite alternate;
  --animate-float: float 6s ease-in-out infinite;
  --animate-spin-slow: spin 8s linear infinite;
  --animate-shine: shine 1.2s ease-out forwards;

  @keyframes marquee {
    to { transform: translateX(-50%); }
  }
  @keyframes aurora {
    0% { transform: translate3d(-8%, -6%, 0) scale(1); }
    50% { transform: translate3d(6%, 4%, 0) scale(1.15); }
    100% { transform: translate3d(-4%, 8%, 0) scale(1.05); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes shine {
    from { transform: translateX(-120%) skewX(-12deg); }
    to { transform: translateX(220%) skewX(-12deg); }
  }
}

@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes rotate-angle {
  to { --angle: 360deg; }
}

@layer base {
  * { border-color: var(--border); }
  html { scroll-behavior: smooth; }
  body {
    @apply bg-background text-text font-sans antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3, h4 { @apply font-display tracking-tight; }
  :focus-visible { @apply outline-2 outline-offset-2 outline-primary; }
  ::selection { background: color-mix(in srgb, var(--primary) 25%, transparent); }
}

@layer utilities {
  .glass {
    background: var(--glass);
    backdrop-filter: saturate(160%) blur(14px);
    -webkit-backdrop-filter: saturate(160%) blur(14px);
  }
  .text-gradient {
    background-image: linear-gradient(100deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .dot-grid {
    background-image: radial-gradient(color-mix(in srgb, var(--text) 12%, transparent) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .mask-fade-x {
    mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
  }
  .conic-border {
    position: relative;
    background: conic-gradient(from var(--angle), var(--primary), var(--accent), var(--primary));
    animation: rotate-angle 6s linear infinite;
  }
  .link-underline {
    background-image: linear-gradient(currentColor, currentColor);
    background-size: 0% 1.5px;
    background-repeat: no-repeat;
    background-position: left 100%;
    transition: background-size 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .link-underline:hover, .link-underline:focus-visible { background-size: 100% 1.5px; }
  .preserve-3d { transform-style: preserve-3d; }
  .perspective { perspective: 1200px; }
}

/* Theme change: circular reveal driven from ThemeToggle via the View Transitions API. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .conic-border, .animate-marquee, .animate-aurora, .animate-float, .animate-spin-slow { animation: none !important; }
}
```

- [ ] **Step 6: Implement providers**

`components/motion/MotionProvider.tsx`:
```tsx
"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
```

`components/motion/SmoothScroll.tsx` (Lenis already disables smoothing under `prefers-reduced-motion`; we also skip it on touch devices, where native scrolling is better). Media-query detection goes through `useSyncExternalStore` so it is SSR-safe, reacts to live changes, and never calls a state setter inside an effect:
```tsx
"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

// Smooth scrolling is off on touch devices and under reduced motion.
const DISABLE_QUERY = "(hover: none), (prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DISABLE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSnapshot = () => !window.matchMedia(DISABLE_QUERY).matches;
const getServerSnapshot = () => false;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```

`app/providers.tsx`:
```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </MotionProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Rewrite `app/layout.tsx` with fonts, providers and the no-JS reveal fix**

(Navbar, Footer, ScrollProgress and BackToTop are added in Tasks 8 and 18.)
```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Allyouneed — Everything your business runs on. One OS.", template: "%s · Allyouneed" },
  description: "HR, payroll, accounting, CRM, inventory, projects and GST filing for growing Indian businesses. One login, one source of truth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Run all gates**

Run: `npm test` → all pass. `npm run typecheck` → clean. `npm run lint` → clean. `npx next build` → compiles (fonts download from Google at build time; a network hiccup here just needs a re-run).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, global styles, fonts, theme/motion/scroll providers" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Brand kit — SVG logos, React logo components, PNG rendering script

**Files:**
- Create: `public/brand/mark.svg`, `public/brand/logo.svg`, `public/brand/logo-dark.svg`, `public/brand/app-icon.svg`, `public/brand/og.svg`, `app/icon.svg`, `scripts/render-brand.mjs`, `components/brand/LogoMark.tsx`, `components/brand/Logo.tsx`, `components/brand/AnimatedLogo.tsx`, `tests/components/brand/Logo.test.tsx`, `tests/scripts/render-brand.test.ts`

**Interfaces:**
- Produces: `<LogoMark size?: number; className?: string; title?: string />` (inline SVG, `role="img"`), `<Logo href?: string; className?: string; markSize?: number />` (mark + wordmark, wraps in `next/link` when `href` given), `<AnimatedLogo size?: number; delay?: number; className?: string />` (hero assembly animation; fires once on mount). PNGs: `public/brand/og.png` (1200×630), `apple-icon.png` (180), `icon-192.png`, `icon-512.png`.

- [ ] **Step 1: Write the SVG source files**

`public/brand/mark.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <title>Allyouneed</title>
  <rect x="2" y="2" width="20" height="20" rx="6" fill="#534AB7"/>
  <rect x="26" y="2" width="20" height="20" rx="6" fill="#7F77DD"/>
  <rect x="2" y="26" width="20" height="20" rx="6" fill="#7F77DD"/>
  <rect x="26" y="26" width="20" height="20" rx="10" fill="#EF9F27"/>
</svg>
```

`app/icon.svg`: identical content to `mark.svg` (copy the file).

`public/brand/logo.svg` (light backgrounds):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48" width="260" height="48">
  <title>Allyouneed</title>
  <rect x="2" y="2" width="20" height="20" rx="6" fill="#534AB7"/>
  <rect x="26" y="2" width="20" height="20" rx="6" fill="#7F77DD"/>
  <rect x="2" y="26" width="20" height="20" rx="6" fill="#7F77DD"/>
  <rect x="26" y="26" width="20" height="20" rx="10" fill="#EF9F27"/>
  <text x="60" y="34" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="700" font-size="28" letter-spacing="-0.5" fill="#0F172A">allyou<tspan fill="#7F77DD">need</tspan></text>
</svg>
```

`public/brand/logo-dark.svg`: same as `logo.svg` but the `<text>` has `fill="#E7E9F5"`.

`public/brand/app-icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>Allyouneed app icon</title>
  <rect width="512" height="512" rx="112" fill="#534AB7"/>
  <rect x="112" y="112" width="132" height="132" rx="36" fill="#FFFFFF"/>
  <rect x="268" y="112" width="132" height="132" rx="36" fill="#FFFFFF" opacity="0.85"/>
  <rect x="112" y="268" width="132" height="132" rx="36" fill="#FFFFFF" opacity="0.85"/>
  <rect x="268" y="268" width="132" height="132" rx="66" fill="#EF9F27"/>
</svg>
```

`public/brand/og.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <title>Allyouneed — Everything your business runs on. One OS.</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1020"/>
      <stop offset="1" stop-color="#1B1B4A"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#7F77DD" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7F77DD" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96 120) scale(2.4)">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#7F77DD"/>
    <rect x="26" y="2" width="20" height="20" rx="6" fill="#AFA9EC"/>
    <rect x="2" y="26" width="20" height="20" rx="6" fill="#AFA9EC"/>
    <rect x="26" y="26" width="20" height="20" rx="10" fill="#EF9F27"/>
  </g>
  <text x="240" y="205" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="700" font-size="64" letter-spacing="-1.5" fill="#E7E9F5">allyou<tspan fill="#AFA9EC">need</tspan></text>
  <text x="96" y="350" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="800" font-size="72" letter-spacing="-2" fill="#FFFFFF">Everything your business</text>
  <text x="96" y="435" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="800" font-size="72" letter-spacing="-2" fill="#FFFFFF">runs on. <tspan fill="#EF9F27">One OS.</tspan></text>
  <text x="96" y="520" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="30" fill="#A3A9C7">HR · Payroll · Accounting · CRM · Inventory · GST filing — for growing Indian businesses</text>
</svg>
```

- [ ] **Step 2: Write the failing test for the render script output**

`tests/scripts/render-brand.test.ts`:
```ts
import { test, expect } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const brand = join(process.cwd(), "public", "brand");

test.each(["og.png", "apple-icon.png", "icon-192.png", "icon-512.png"])("%s exists and is a non-empty PNG", (file) => {
  const p = join(brand, file);
  expect(existsSync(p)).toBe(true);
  expect(statSync(p).size).toBeGreaterThan(500);
});
```

Run: `npx vitest run tests/scripts`
Expected: FAIL — files do not exist.

- [ ] **Step 3: Write `scripts/render-brand.mjs`**

```js
// Renders brand SVGs to PNGs that social networks and manifests require.
// Run with: npm run brand  (outputs are committed so builds never depend on this step)
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brandDir = join(process.cwd(), "public", "brand");

const jobs = [
  { src: "og.svg", out: "og.png", width: 1200 },
  { src: "app-icon.svg", out: "apple-icon.png", width: 180 },
  { src: "app-icon.svg", out: "icon-192.png", width: 192 },
  { src: "app-icon.svg", out: "icon-512.png", width: 512 },
];

for (const job of jobs) {
  const svg = readFileSync(join(brandDir, job.src), "utf8");
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: job.width },
    font: { loadSystemFonts: true, defaultFontFamily: "Arial" },
  })
    .render()
    .asPng();
  writeFileSync(join(brandDir, job.out), png);
  console.log(`${job.out} (${png.length} bytes)`);
}
```

Run: `npm run brand`
Expected: four lines like `og.png (NNNN bytes)`.

Run: `npx vitest run tests/scripts`
Expected: 4 tests pass.

- [ ] **Step 4: Write failing tests for the logo components**

`tests/components/brand/Logo.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";
import { LogoMark } from "@/components/brand/LogoMark";

test("LogoMark is an accessible image", () => {
  render(<LogoMark />);
  expect(screen.getByRole("img", { name: "Allyouneed" })).toBeInTheDocument();
});

test("Logo renders the wordmark and links home", () => {
  render(<Logo href="/" />);
  const link = screen.getByRole("link", { name: /allyouneed home/i });
  expect(link).toHaveAttribute("href", "/");
  expect(link).toHaveTextContent("allyouneed");
});

test("Logo without href renders no link", () => {
  render(<Logo />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("need")).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/brand`
Expected: FAIL — modules not found.

- [ ] **Step 5: Implement the logo components**

`components/brand/LogoMark.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = { size?: number; className?: string; title?: string };

export function LogoMark({ size = 32, className, title = "Allyouneed" }: Props) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <title>{title}</title>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#534AB7" />
      <rect x="26" y="2" width="20" height="20" rx="6" fill="#7F77DD" />
      <rect x="2" y="26" width="20" height="20" rx="6" fill="#7F77DD" />
      <rect x="26" y="26" width="20" height="20" rx="10" fill="#EF9F27" />
    </svg>
  );
}
```

`components/brand/Logo.tsx`:
```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LogoMark } from "./LogoMark";

type Props = { href?: string; className?: string; markSize?: number };

export function Logo({ href, className, markSize = 32 }: Props) {
  const content = (
    <>
      <LogoMark size={markSize} title="" />
      <span className="font-display text-xl font-bold tracking-tight text-text">
        allyou<span className="text-[#7F77DD]">need</span>
      </span>
    </>
  );
  const classes = cn("inline-flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} aria-label="Allyouneed home" className={classes}>
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
}
```

Note: `LogoMark` with `title=""` renders an empty `<title>`, and `aria-label=""` — fine inside a labelled link. Make `LogoMark` omit `role`/`aria-label` when `title` is empty to keep the accessibility tree clean:

Update `LogoMark.tsx` — replace the opening `<svg ...>` and `<title>` with:
```tsx
    <svg
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
```

`components/brand/AnimatedLogo.tsx` (hero assembly: three indigo tiles slide in from different directions, amber tile drops in last with a spring "click"; renders static under reduced motion):
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

type Props = { size?: number; delay?: number; className?: string };

const tiles = [
  { x: 2, y: 2, rx: 6, fill: "#534AB7", from: { x: -40, y: -40 } },
  { x: 26, y: 2, rx: 6, fill: "#7F77DD", from: { x: 40, y: -40 } },
  { x: 2, y: 26, rx: 6, fill: "#7F77DD", from: { x: -40, y: 40 } },
];

// Motion treats `x`/`y` on SVG elements as translate transforms, so the static rect
// attributes live on a plain <rect> and each tile is animated through a wrapping <m.g>.
const groupStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

export function AnimatedLogo({ size = 96, delay = 0, className }: Props) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true" data-reveal>
      {tiles.map((t, i) => (
        <m.g
          key={i}
          initial={reduce ? false : { opacity: 0, x: t.from.x, y: t.from.y, rotate: -12 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease, delay: delay + i * 0.12 }}
          style={groupStyle}
        >
          <rect x={t.x} y={t.y} width={20} height={20} rx={t.rx} fill={t.fill} />
        </m.g>
      ))}
      <m.g
        initial={reduce ? false : { opacity: 0, scale: 0.2, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 18, delay: delay + 0.5 }}
        style={groupStyle}
      >
        <rect x={26} y={26} width={20} height={20} rx={10} fill="#EF9F27" />
      </m.g>
    </svg>
  );
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run tests/components/brand tests/scripts` → 7 pass. `npm run typecheck` and `npm run lint` → clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(brand): add module-grid logo SVGs, logo components and PNG render script" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 4: Content data layer (all copy as typed data)

**Files:**
- Create: `content/site.ts`, `content/nav.ts`, `content/modules.ts`, `content/stats.ts`, `content/integrations.ts`, `content/testimonials.ts`, `content/tax.ts`, `content/pricing.ts`, `content/faq.ts`, `content/workflow.ts`, `content/journey.ts`, `content/about.ts`, `content/legal/terms.ts`, `content/legal/privacy.ts`, `content/legal/refund.ts`, `tests/content/integrity.test.ts`

**Interfaces:**
- Produces (used by every later task): `site`, `mainNav: NavLink[]`, `footerColumns`, `compliance`, `modules: Module[]`, `stats: Stat[]`, `trustLogos: string[]`, `integrations: Integration[]`, `testimonials: Testimonial[]`, `taxCategories: TaxCategory[]`, `complianceCalendar: CalendarItem[]`, `plans: Plan[]`, `comparisonRows: ComparisonRow[]`, `faqs: Faq[]`, `workflowSteps`, `journey`, `about`, `termsDoc/privacyDoc/refundDoc: LegalDoc`. Types are exported from each file.

- [ ] **Step 1: Write the failing content-integrity test**

`tests/content/integrity.test.ts`:
```ts
import { describe, test, expect } from "vitest";
import { modules } from "@/content/modules";
import { plans, comparisonRows } from "@/content/pricing";
import { taxCategories, complianceCalendar } from "@/content/tax";
import { faqs } from "@/content/faq";
import { testimonials } from "@/content/testimonials";
import { integrations } from "@/content/integrations";
import { stats, trustLogos } from "@/content/stats";
import { mainNav, footerColumns } from "@/content/nav";
import { termsDoc, privacyDoc, refundDoc } from "@/content/legal";

describe("modules", () => {
  test("there are 12 modules with complete data and unique slugs", () => {
    expect(modules).toHaveLength(12);
    const slugs = modules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(12);
    for (const m of modules) {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
      expect(m.name.length).toBeGreaterThan(2);
      expect(m.short.length).toBeGreaterThan(10);
      expect(m.description.length).toBeGreaterThan(60);
      expect(m.bullets.length).toBeGreaterThanOrEqual(4);
      expect(m.bullets.length).toBeLessThanOrEqual(6);
      expect(m.icon).toBeDefined();
    }
  });
});

describe("pricing", () => {
  test("four plans, one highlighted, Enterprise has no price", () => {
    expect(plans).toHaveLength(4);
    expect(plans.filter((p) => p.highlight)).toHaveLength(1);
    expect(new Set(plans.map((p) => p.id)).size).toBe(4);
    const enterprise = plans.find((p) => p.id === "enterprise")!;
    expect(enterprise.monthly).toBeNull();
    for (const p of plans) {
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.cta.href.startsWith("/")).toBe(true);
    }
  });
  test("comparison rows cover every plan", () => {
    for (const row of comparisonRows) {
      for (const p of plans) expect(row.values).toHaveProperty(p.id);
    }
  });
});

describe("tax", () => {
  test("six categories, each with filings", () => {
    expect(taxCategories).toHaveLength(6);
    for (const c of taxCategories) expect(c.filings.length).toBeGreaterThanOrEqual(4);
    expect(complianceCalendar.length).toBeGreaterThanOrEqual(6);
    for (const item of complianceCalendar) expect(item.day).toBeGreaterThanOrEqual(1);
  });
});

describe("misc content", () => {
  test("faqs, testimonials, integrations, stats, logos, nav", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(6);
    expect(testimonials).toHaveLength(3);
    expect(integrations.length).toBeGreaterThanOrEqual(6);
    expect(stats).toHaveLength(4);
    expect(trustLogos.length).toBeGreaterThanOrEqual(8);
    expect(mainNav.map((l) => l.href)).toEqual(["/features/", "/tax-compliance/", "/pricing/", "/about/", "/contact/"]);
    expect(footerColumns).toHaveLength(3);
  });
  test("legal docs have sections and a review notice", () => {
    for (const doc of [termsDoc, privacyDoc, refundDoc]) {
      expect(doc.sections.length).toBeGreaterThanOrEqual(4);
      expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

Run: `npx vitest run tests/content`
Expected: FAIL — content modules not found.

- [ ] **Step 2: Write `content/site.ts` and `content/nav.ts`**

`content/site.ts`:
```ts
export const site = {
  name: "Allyouneed",
  legalName: "Allyouneed Technologies Private Limited", // PLACEHOLDER
  tagline: "Everything your business runs on. One OS.",
  description:
    "HR, payroll, accounting, CRM, inventory, projects and GST filing for growing Indian businesses. One login, one source of truth.",
  url: "https://allyouneed.in", // PLACEHOLDER — real domain goes here
  email: "hello@allyouneed.in", // PLACEHOLDER
  phone: "+91 80 4711 0000", // PLACEHOLDER
  phoneHref: "tel:+918047110000",
  address: "4th Floor, 100 Feet Road, Indiranagar, Bengaluru 560038", // PLACEHOLDER
  hours: "Monday to Saturday, 9:30 am to 6:30 pm IST",
  social: {
    linkedin: "https://www.linkedin.com/company/allyouneed", // PLACEHOLDER
    x: "https://x.com/allyouneed", // PLACEHOLDER
    youtube: "https://www.youtube.com/@allyouneed", // PLACEHOLDER
  },
} as const;
```

`content/nav.ts`:
```ts
export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "Features", href: "/features/" },
  { label: "Tax & Compliance", href: "/tax-compliance/" },
  { label: "Pricing", href: "/pricing/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features/" },
      { label: "Tax & Compliance", href: "/tax-compliance/" },
      { label: "Pricing", href: "/pricing/" },
      { label: "Log in", href: "/login/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "Contact", href: "/contact/" },
      { label: "Book a demo", href: "/contact/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms/" },
      { label: "Privacy Policy", href: "/privacy/" },
      { label: "Refund Policy", href: "/refund/" },
    ],
  },
];

// Phrased as alignment, not certification — see spec §8.
export const compliance: { code: string; label: string }[] = [
  { code: "DPDP 2023", label: "Digital Personal Data Protection Act, India" },
  { code: "IT Act §43A", label: "Reasonable security practices" },
  { code: "GDPR", label: "EU Regulation 2016/679" },
  { code: "ISO 27001", label: "Information security management" },
  { code: "SOC 2", label: "Security & availability controls" },
];
```

- [ ] **Step 3: Write `content/modules.ts`**

```ts
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Wallet,
  BookOpen,
  Target,
  Package,
  Fingerprint,
  Landmark,
  FolderKanban,
  Laptop,
  ChartColumn,
  MessageSquare,
  Plug,
} from "lucide-react";

export type MockupKind = "dashboard" | "accounting" | "inventory" | "pos" | "crm" | "itr" | "none";

export type Module = {
  slug: string;
  name: string;
  short: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
  mockup: MockupKind;
};

export const modules: Module[] = [
  {
    slug: "hr",
    name: "Employee & HR",
    short: "One record per person, from offer letter to exit.",
    description:
      "Keep every employee's profile, documents, leave, and lifecycle events in one place. Onboarding checklists, policy acknowledgements and org charts update themselves as people join, move teams or leave.",
    bullets: [
      "Digital onboarding with e-signed offer letters and document collection",
      "Leave types, holiday calendars and approval chains per location",
      "Org chart, reporting lines and role-based access",
      "Employee self-service for payslips, Form 16 and reimbursements",
      "Exit workflow with full-and-final settlement hand-off to payroll",
    ],
    icon: Users,
    mockup: "dashboard",
  },
  {
    slug: "payroll",
    name: "Payroll",
    short: "Run salaries in minutes, with PF, ESI, PT and TDS built in.",
    description:
      "Payroll reads attendance, leave and reimbursements directly, so there is nothing to re-enter. Statutory deductions are calculated per state and filed from the same screen you approve salaries on.",
    bullets: [
      "Salary structures with CTC breakups, arrears and variable pay",
      "Automatic PF, ESI, Professional Tax and LWF by state",
      "TDS on salary with investment declarations and proofs",
      "Bank transfer files and payslips in one click",
      "Form 16 generation and 24Q filing from payroll data",
    ],
    icon: Wallet,
    mockup: "dashboard",
  },
  {
    slug: "accounting",
    name: "Accounting",
    short: "Double-entry books that write themselves.",
    description:
      "Every invoice, purchase, payroll run and expense posts to the ledger automatically. Reconcile bank feeds, close the month and hand your CA a trial balance without a spreadsheet in sight.",
    bullets: [
      "Chart of accounts with cost centres and multi-branch books",
      "Sales and purchase invoices with e-invoicing (IRN) and e-way bills",
      "Bank reconciliation with rule-based matching",
      "Receivables and payables ageing, reminders and credit notes",
      "P&L, balance sheet, cash flow and GST-ready reports",
      "Audit trail on every entry, as required under the Companies Act",
    ],
    icon: BookOpen,
    mockup: "accounting",
  },
  {
    slug: "crm",
    name: "CRM & Leads",
    short: "Capture every lead, follow up on time, close more.",
    description:
      "Leads flow in from your website, WhatsApp, Meta ads and listing sites into one pipeline. Assign, follow up and quote without leaving the board, and see exactly which channel pays for itself.",
    bullets: [
      "Kanban pipeline with stages, owners and rotting alerts",
      "Lead capture from web forms, WhatsApp, Meta and Google Business",
      "Quotes and proforma invoices that convert to sales orders",
      "Call, WhatsApp and email logging on the contact timeline",
      "Source-wise conversion and revenue reports",
    ],
    icon: Target,
    mockup: "crm",
  },
  {
    slug: "inventory",
    name: "Inventory & POS",
    short: "Stock, batches and billing across every counter and warehouse.",
    description:
      "Track stock by location, batch and expiry, bill at the counter with barcode scanning, and let purchase suggestions fire before you run out. Every sale posts to accounting and GST instantly.",
    bullets: [
      "Multi-warehouse stock with transfers and adjustments",
      "Batch, serial and expiry tracking",
      "Touch-friendly POS with barcode scanning and split payments",
      "Reorder levels and automatic purchase suggestions",
      "Stock valuation (FIFO / weighted average) and GST HSN summaries",
    ],
    icon: Package,
    mockup: "pos",
  },
  {
    slug: "attendance",
    name: "Attendance",
    short: "Biometric, mobile or web check-ins, straight into payroll.",
    description:
      "Capture attendance from biometric devices, geo-fenced mobile punches or the web. Shifts, overtime and late marks are computed by policy and feed payroll without a single export.",
    bullets: [
      "Biometric device sync and geo-fenced mobile check-in",
      "Shift rosters, week-offs and rotational schedules",
      "Overtime, late-mark and short-leave rules",
      "Regularisation requests with manager approval",
      "Muster roll and attendance registers for inspections",
    ],
    icon: Fingerprint,
    mockup: "dashboard",
  },
  {
    slug: "tax-filing",
    name: "Tax Filing",
    short: "GST, TDS, ITR and ROC — filed from the data you already have.",
    description:
      "Returns are prepared from your live books, reconciled against the government portal, and filed with a review step. Due dates, challans and acknowledgements live on one compliance calendar.",
    bullets: [
      "GSTR-1, GSTR-3B and GSTR-9 with 2A/2B reconciliation",
      "TDS returns (24Q, 26Q, 27Q) and Form 16 / 16A",
      "Corporate and individual income-tax returns with advance-tax planner",
      "ROC filings: AOC-4, MGT-7, DIR-3 KYC",
      "Compliance calendar with reminders and status tracking",
    ],
    icon: Landmark,
    mockup: "itr",
  },
  {
    slug: "projects",
    name: "Projects",
    short: "Plan work, log time, bill clients — all connected.",
    description:
      "Break projects into tasks and milestones, log time against them and turn approved hours into invoices. Profitability per project is visible because costs come from payroll and purchases automatically.",
    bullets: [
      "Boards, lists and Gantt views with dependencies",
      "Timesheets with approval and billable / non-billable split",
      "Milestone-based invoicing to accounting",
      "Project budgets versus actual cost from payroll and purchases",
      "Client portal for status and approvals",
    ],
    icon: FolderKanban,
    mockup: "dashboard",
  },
  {
    slug: "assets",
    name: "Assets",
    short: "Every laptop, machine and licence — who has it, what it's worth.",
    description:
      "Register fixed assets and IT equipment, assign them to people or locations and let depreciation post to the books on schedule. Maintenance and warranty reminders keep surprises away.",
    bullets: [
      "Asset register with QR tags and photos",
      "Assignment to employees, sites or departments",
      "Depreciation schedules (Companies Act and Income Tax rates)",
      "Warranty, AMC and maintenance reminders",
      "Disposal and write-off workflow with ledger posting",
    ],
    icon: Laptop,
    mockup: "none",
  },
  {
    slug: "reports",
    name: "Reports",
    short: "Dashboards for founders, drill-downs for finance.",
    description:
      "Because every module shares one database, reports need no imports. Build dashboards per role, schedule them to inboxes, and drill from a KPI down to the exact voucher behind it.",
    bullets: [
      "Founder dashboard: cash, receivables, payroll cost, pipeline",
      "Drill-down from any number to the source entry",
      "Scheduled email and WhatsApp report delivery",
      "Custom report builder with filters and pivots",
      "Export to Excel, PDF and Tally-compatible formats",
    ],
    icon: ChartColumn,
    mockup: "dashboard",
  },
  {
    slug: "communications",
    name: "Communications",
    short: "WhatsApp, SMS and email from inside every workflow.",
    description:
      "Send invoices, payslips, reminders and campaign messages on WhatsApp, SMS or email using approved templates. Replies land on the customer's or employee's timeline, not in someone's phone.",
    bullets: [
      "WhatsApp Business API templates for invoices and reminders",
      "Payment reminders that stop automatically when paid",
      "Broadcasts and campaigns with opt-out handling",
      "Internal announcements and policy acknowledgements",
      "Shared inbox with assignment and SLAs",
    ],
    icon: MessageSquare,
    mockup: "crm",
  },
  {
    slug: "integrations",
    name: "Integrations",
    short: "Payments, marketplaces, banks and your own tools.",
    description:
      "Connect payment gateways, marketplaces, telephony and banks, or build on the REST API and webhooks. Data arrives already mapped to the right module, so nothing needs re-keying.",
    bullets: [
      "Payment gateways with automatic receipt matching",
      "Meta lead ads, Google Business and listing-site lead sync",
      "Cloud telephony with click-to-call and call recording links",
      "Bank feeds and statement imports",
      "REST API, webhooks and CSV importers",
    ],
    icon: Plug,
    mockup: "none",
  },
];

export function getModule(slug: string) {
  return modules.find((m) => m.slug === slug);
}
```

- [ ] **Step 4: Write `content/stats.ts`, `content/integrations.ts`, `content/testimonials.ts`**

`content/stats.ts`:
```ts
export type Stat = { value: number; suffix: string; label: string; decimals?: number };

// PLACEHOLDER — replace with real figures before launch.
export const stats: Stat[] = [
  { value: 200, suffix: "+", label: "Organisations" },
  { value: 15, suffix: "+", label: "Modules, one login" },
  { value: 40, suffix: "K+", label: "Employees managed" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", decimals: 1 },
];

// PLACEHOLDER — fictional customer names for the trust marquee.
export const trustLogos: string[] = [
  "Meridian Foods",
  "Kaveri Textiles",
  "Nimbus Logistics",
  "Arka Dental Care",
  "Suryodaya Schools",
  "Lumen Retail",
  "Trident Autoworks",
  "Pratham Pharma",
  "Bluefin Exports",
  "Vasant Interiors",
];
```

`content/integrations.ts`:
```ts
import type { LucideIcon } from "lucide-react";
import { CreditCard, MessageCircle, Megaphone, Store, PhoneCall, Code } from "lucide-react";

export type Integration = { name: string; blurb: string; icon: LucideIcon };

export const integrations: Integration[] = [
  { name: "Payment gateways", blurb: "UPI, cards and net-banking receipts matched to invoices automatically.", icon: CreditCard },
  { name: "WhatsApp Business", blurb: "Invoices, payslips and reminders on the channel your customers read.", icon: MessageCircle },
  { name: "Meta lead ads", blurb: "Instagram and Facebook leads land in the CRM within seconds.", icon: Megaphone },
  { name: "Google Business & listings", blurb: "Enquiries from your profile and listing sites become leads.", icon: Store },
  { name: "Cloud telephony", blurb: "Click-to-call, IVR and call logs on the contact timeline.", icon: PhoneCall },
  { name: "REST API & webhooks", blurb: "Build your own connections or import from Tally and Excel.", icon: Code },
];
```

`content/testimonials.ts`:
```ts
export type Testimonial = { quote: string; name: string; role: string; company: string; initials: string };

// PLACEHOLDER — fictional testimonials; replace with real, permissioned quotes.
export const testimonials: Testimonial[] = [
  {
    quote:
      "We closed our first month-end in two days instead of two weeks. Payroll, GST and the books finally agree with each other.",
    name: "Rhea Kulkarni",
    role: "Co-founder",
    company: "Meridian Foods",
    initials: "RK",
  },
  {
    quote:
      "Leads from Instagram used to sit in a WhatsApp group. Now they're in a pipeline with owners, and our follow-up time dropped to under an hour.",
    name: "Arjun Mehta",
    role: "Head of Sales",
    company: "Vasant Interiors",
    initials: "AM",
  },
  {
    quote:
      "Four branches, one stock view. GSTR-1 goes out on the 9th every month without anyone touching Excel.",
    name: "Shalini Iyer",
    role: "Finance Lead",
    company: "Lumen Retail",
    initials: "SI",
  },
];
```

- [ ] **Step 5: Write `content/tax.ts`**

```ts
import type { LucideIcon } from "lucide-react";
import { Receipt, Percent, Landmark, HandCoins, Building2, FileBadge } from "lucide-react";

export type TaxCategory = {
  slug: string;
  name: string;
  tagline: string;
  filings: string[];
  icon: LucideIcon;
};

export const taxCategories: TaxCategory[] = [
  {
    slug: "gst",
    name: "GST",
    tagline: "Returns prepared from your live sales and purchase registers.",
    filings: ["GSTR-1 (outward supplies)", "GSTR-3B (monthly summary and payment)", "GSTR-9 / 9C (annual return and reconciliation)", "GSTR-2A / 2B input-tax reconciliation", "E-invoicing (IRN) and e-way bills", "Composition scheme CMP-08"],
    icon: Receipt,
  },
  {
    slug: "tds",
    name: "TDS & TCS",
    tagline: "Deduct at source on salaries and vendors, deposit, file, issue certificates.",
    filings: ["24Q (salary TDS)", "26Q (non-salary TDS)", "27Q (payments to non-residents)", "27EQ (TCS)", "Form 16 and Form 16A certificates", "Monthly challan (ITNS 281) payments"],
    icon: Percent,
  },
  {
    slug: "income-tax",
    name: "Income tax",
    tagline: "Corporate and individual returns with an advance-tax planner.",
    filings: ["ITR-3 / ITR-4 (proprietors and professionals)", "ITR-5 (firms and LLPs)", "ITR-6 (companies)", "Advance tax instalments (June, September, December, March)", "Tax audit support (Form 3CA/3CB-3CD)", "Employee ITR-1 / ITR-2 from Form 16"],
    icon: Landmark,
  },
  {
    slug: "payroll-contributions",
    name: "Payroll contributions",
    tagline: "State-wise statutory deductions computed inside payroll.",
    filings: ["EPF (ECR upload and payment)", "ESI monthly contribution", "Professional Tax by state", "Labour Welfare Fund", "Gratuity and bonus registers"],
    icon: HandCoins,
  },
  {
    slug: "roc",
    name: "Company & ROC filings",
    tagline: "Annual filings and registers kept current from your books.",
    filings: ["AOC-4 (financial statements)", "MGT-7 / MGT-7A (annual return)", "DIR-3 KYC (director KYC)", "ADT-1 (auditor appointment)", "Statutory registers and board-meeting minutes", "LLP Form 8 and Form 11"],
    icon: Building2,
  },
  {
    slug: "registrations",
    name: "Registrations",
    tagline: "Get every number you need, from incorporation to import-export.",
    filings: ["Company / LLP incorporation (SPICe+)", "GST registration and amendments", "PF and ESI registration", "Professional Tax and Shops & Establishment", "Import Export Code (IEC)", "MSME / Udyam registration"],
    icon: FileBadge,
  },
];

export type CalendarItem = { day: number; title: string; category: string };

// Typical monthly due dates for a regular (non-QRMP) taxpayer.
export const complianceCalendar: CalendarItem[] = [
  { day: 7, title: "TDS / TCS deposit for previous month", category: "TDS" },
  { day: 11, title: "GSTR-1 for previous month", category: "GST" },
  { day: 13, title: "GSTR-1 IFF (QRMP taxpayers)", category: "GST" },
  { day: 15, title: "PF (ECR) and ESI contribution payment", category: "Payroll" },
  { day: 15, title: "Advance tax instalment (Jun, Sep, Dec, Mar)", category: "Income tax" },
  { day: 20, title: "GSTR-3B and GST payment", category: "GST" },
  { day: 30, title: "Professional Tax payment (state-specific)", category: "Payroll" },
  { day: 31, title: "Quarterly TDS return (24Q / 26Q), quarter-end months", category: "TDS" },
];
```

- [ ] **Step 6: Write `content/pricing.ts` and `content/faq.ts`**

`content/pricing.ts`:
```ts
export type PlanId = "free" | "growth" | "business" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number | null; // INR per month, billed monthly; null = custom
  users: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

// PLACEHOLDER prices — edit freely; lib/pricing.ts derives yearly prices.
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    users: "Up to 5 users",
    description: "For new businesses getting their books and pipeline in order.",
    features: ["Accounting with GST-ready invoices", "CRM pipeline and lead capture forms", "1 branch, 1 GSTIN", "Community support"],
    cta: { label: "Start free", href: "/register/" },
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 999,
    users: "Up to 25 users",
    description: "Every module, GST filing included, for teams that are scaling.",
    features: ["All 12 modules", "GSTR-1 and GSTR-3B filing", "Inventory and POS for up to 3 locations", "WhatsApp and payment gateway integrations", "Email and chat support"],
    cta: { label: "Start free trial", href: "/register/" },
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 2999,
    users: "Up to 100 users",
    description: "Payroll, TDS and multi-branch control for established companies.",
    features: ["Everything in Growth", "Payroll with PF, ESI, PT and TDS filing", "Unlimited branches and GSTINs", "Meta, Google Business and telephony integrations", "Priority support with a named account manager"],
    cta: { label: "Start free trial", href: "/register/" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    users: "Unlimited users",
    description: "Dedicated compliance team, SSO and custom integrations.",
    features: ["Everything in Business", "Dedicated chartered accountant", "SSO (SAML / Google Workspace) and audit logs", "Custom integrations and data residency options", "99.9% uptime SLA with 24×7 support"],
    cta: { label: "Contact sales", href: "/contact/" },
  },
];

export type ComparisonRow = { label: string; values: Record<PlanId, string | boolean> };

export const comparisonRows: ComparisonRow[] = [
  { label: "Users", values: { free: "5", growth: "25", business: "100", enterprise: "Unlimited" } },
  { label: "Modules", values: { free: "Accounting, CRM", growth: "All 12", business: "All 12", enterprise: "All 12" } },
  { label: "Branches / GSTINs", values: { free: "1", growth: "3", business: "Unlimited", enterprise: "Unlimited" } },
  { label: "GST filing", values: { free: false, growth: true, business: true, enterprise: true } },
  { label: "Payroll & TDS filing", values: { free: false, growth: false, business: true, enterprise: true } },
  { label: "Integrations", values: { free: "Web forms", growth: "WhatsApp, payments", business: "All", enterprise: "All + custom" } },
  { label: "Dedicated CA", values: { free: false, growth: false, business: false, enterprise: true } },
  { label: "SSO & audit logs", values: { free: false, growth: false, business: false, enterprise: true } },
  { label: "Support", values: { free: "Community", growth: "Email, chat", business: "Priority", enterprise: "24×7" } },
];
```

`content/faq.ts`:
```ts
export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  { q: "Is there really a free plan?", a: "Yes. Up to five users get accounting and CRM free for as long as you like. You only pay when you need more users or modules." },
  { q: "Do I need a chartered accountant to file GST with Allyouneed?", a: "No. Returns are prepared from your books and you review them before filing. If you would like a professional to check them, you can add a CA review from our network for a fixed fee." },
  { q: "Can I move from Tally or Zoho Books?", a: "Yes. Import your ledgers, opening balances, items and contacts with our guided importer. Most businesses finish in an afternoon." },
  { q: "How does yearly billing work?", a: "Pay for 12 months upfront and save about 20% compared with monthly billing. You can switch from monthly to yearly at any time." },
  { q: "Where is my data stored?", a: "In data centres located in India, encrypted at rest and in transit. Enterprise plans can choose a dedicated region." },
  { q: "Can I add or remove users mid-month?", a: "Yes. Additional users are charged pro-rata and removed users stop billing immediately." },
  { q: "Is there a mobile app?", a: "The Allyouneed mobile app for Android and iOS is coming soon. It covers approvals, attendance, billing, CRM and the founder dashboard." },
  { q: "What happens if I cancel?", a: "You keep read-only access to your data for 90 days and can export everything to Excel or Tally formats at any time. See the refund policy for details." },
];
```

- [ ] **Step 7: Write `content/workflow.ts`, `content/journey.ts`, `content/about.ts`**

`content/workflow.ts`:
```ts
import type { LucideIcon } from "lucide-react";
import { PenLine, RefreshCw, Sparkles, FileCheck } from "lucide-react";

export type WorkflowStep = { title: string; body: string; icon: LucideIcon };

export const workflowSteps: WorkflowStep[] = [
  { title: "Record it once", body: "An invoice is raised, a salary is approved, stock is received. One entry, where the work happens.", icon: PenLine },
  { title: "Every module syncs", body: "Ledgers, stock, GST registers and dashboards update in the same instant. Nothing is re-typed.", icon: RefreshCw },
  { title: "AI flags what's off", body: "Duplicate vendors, mismatched ITC, a payslip that jumped 40% — surfaced before they become problems.", icon: Sparkles },
  { title: "Reports and returns follow", body: "Month-end reports and GST, TDS and ROC filings are prepared from the same data, ready for review.", icon: FileCheck },
];
```

`content/journey.ts`:
```ts
export type Milestone = { when: string; title: string; body: string };

export const journey: Milestone[] = [
  { when: "Day 0", title: "Incorporate", body: "Company or LLP incorporation, PAN, TAN and bank account — handled with our partner network." },
  { when: "Week 1", title: "Register & set up", body: "GST, PF, ESI and Professional Tax registrations, chart of accounts, and your team invited." },
  { when: "Every month", title: "Run & file", body: "Payroll, invoicing and stock run daily; GSTR-1, GSTR-3B, TDS and PF are filed on the calendar." },
  { when: "Year end", title: "Close the year", body: "Books closed, ITR and ROC filings done, audit-ready statements shared with your CA." },
];
```

`content/about.ts`:
```ts
import type { LucideIcon } from "lucide-react";
import { Heart, ShieldCheck, Zap, Handshake, Lock, Server, KeyRound, Eye } from "lucide-react";

export const about = {
  mission: "Give every growing Indian business the operating system that large companies take for granted — without the price tag or the consultants.",
  story: [
    "Allyouneed started when our founders ran a 40-person manufacturing business and counted the tools it took to run it: seven, plus a CA, plus a spreadsheet that nobody trusted. Payroll didn't talk to accounting, stock didn't talk to sales, and GST month was a week of reconciliation.",
    "We built the platform we wished we had: one database, one login, every department. Enter a fact once — a sale, a salary, a stock receipt — and let everything else follow, including the filings.",
    "Today Allyouneed runs businesses across retail, manufacturing, services, education and healthcare. We're a small team in Bengaluru, and we still answer support ourselves.",
  ],
  values: [
    { title: "One truth", body: "If two screens disagree, the software is wrong. We remove re-entry wherever it exists.", icon: Zap },
    { title: "Compliance is a feature", body: "Filing on time shouldn't need heroics. Due dates and returns are part of the product, not an add-on.", icon: ShieldCheck },
    { title: "Plain language", body: "No jargon in the UI, no surprises on the bill, no fine print in the policies.", icon: Heart },
    { title: "Built with customers", body: "Every module started as a request from a business that needed it. Most still ship that way.", icon: Handshake },
  ] as { title: string; body: string; icon: LucideIcon }[],
  security: [
    { title: "Encrypted everywhere", body: "TLS 1.2+ in transit, AES-256 at rest, in Indian data centres.", icon: Lock },
    { title: "Role-based access", body: "Granular permissions per module, branch and record, with audit logs.", icon: KeyRound },
    { title: "Backups & uptime", body: "Point-in-time recovery, daily off-site backups and a 99.9% uptime target.", icon: Server },
    { title: "Privacy by design", body: "Built to align with the DPDP Act 2023 and GDPR principles; you own your data and can export it any time.", icon: Eye },
  ] as { title: string; body: string; icon: LucideIcon }[],
} as const;
```

- [ ] **Step 8: Write the legal docs and barrel `content/legal/index.ts`**

`content/legal/types.ts`:
```ts
export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; updated: string; intro: string; sections: LegalSection[] };
```

`content/legal/terms.ts`:
```ts
import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const termsDoc: LegalDoc = {
  title: "Terms & Conditions",
  updated: "2026-09-27",
  intro: "These terms govern your use of the Allyouneed platform, website and mobile applications (the \"Service\") provided by Allyouneed Technologies Private Limited (\"Allyouneed\", \"we\").",
  sections: [
    { heading: "1. Acceptance", body: ["By creating an account or using the Service you agree to these terms on behalf of yourself and the organisation you represent. If you do not agree, do not use the Service."] },
    { heading: "2. Accounts and access", body: ["You are responsible for keeping login credentials confidential and for all activity under your account. Notify us immediately of any unauthorised use.", "Administrators may invite users and set permissions; the organisation is responsible for its users' actions."] },
    { heading: "3. Subscriptions and payment", body: ["Paid plans are billed monthly or yearly in advance in Indian Rupees, exclusive of applicable GST. Prices may change with 30 days' notice; changes apply from your next billing cycle.", "Free plans may be limited in users, modules or storage as described on the pricing page."] },
    { heading: "4. Your data", body: ["You retain ownership of the data you enter. You grant us a licence to process it only to provide, secure and improve the Service. You can export your data at any time in standard formats.", "We process personal data in accordance with our Privacy Policy and the Digital Personal Data Protection Act, 2023."] },
    { heading: "5. Compliance filings", body: ["Returns and filings prepared by the Service are based on the data you enter and require your review and confirmation before submission. You remain responsible for the accuracy and timeliness of your statutory filings. Professional services from our partner network are governed by separate engagement terms."] },
    { heading: "6. Acceptable use", body: ["You may not use the Service to violate any law, infringe intellectual property, transmit malware, or attempt to access other customers' data. We may suspend accounts that pose a security or legal risk."] },
    { heading: "7. Availability and support", body: ["We aim for 99.9% monthly uptime, excluding scheduled maintenance announced in advance. Support channels and response targets depend on your plan."] },
    { heading: "8. Limitation of liability", body: ["To the extent permitted by law, our total liability for any claim arising from the Service is limited to the fees paid by you in the twelve months preceding the claim. We are not liable for indirect or consequential losses, including penalties arising from late or inaccurate filings caused by data you provided."] },
    { heading: "9. Termination", body: ["You may cancel at any time from account settings. We may terminate for material breach with notice. On termination you retain read-only access for 90 days to export your data, after which it is deleted per our retention schedule."] },
    { heading: "10. Governing law", body: ["These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction, subject to arbitration under the Arbitration and Conciliation Act, 1996 where applicable."] },
    { heading: "11. Contact", body: ["Questions about these terms: legal@allyouneed.in."] },
  ],
};
```

`content/legal/privacy.ts`:
```ts
import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const privacyDoc: LegalDoc = {
  title: "Privacy Policy",
  updated: "2026-09-27",
  intro: "This policy explains what personal data Allyouneed collects, why, and the rights you have under the Digital Personal Data Protection Act, 2023 (DPDP Act) and, where applicable, the GDPR.",
  sections: [
    { heading: "1. Who we are", body: ["Allyouneed Technologies Private Limited, Bengaluru, is the Data Fiduciary for data about our website visitors and account holders. For data your organisation enters about its employees, customers and vendors, your organisation is the Data Fiduciary and we act as a Data Processor on its instructions."] },
    { heading: "2. Data we collect", body: ["Account data: name, work email, phone, company and role.", "Usage data: pages viewed, features used, device and browser information, IP address.", "Business data you enter: employee, customer, vendor and financial records needed to provide the Service.", "Support data: messages you send us and call recordings where notified."] },
    { heading: "3. Why we process it", body: ["To provide and secure the Service, bill you, respond to support requests, send service notices, and improve features. Marketing emails are sent only with consent and include an unsubscribe link."] },
    { heading: "4. Legal basis and consent", body: ["We process personal data with your consent or for legitimate uses permitted under the DPDP Act, such as performing a contract you have entered into. You may withdraw consent at any time; this does not affect processing already carried out."] },
    { heading: "5. Sharing", body: ["We share data with sub-processors (cloud hosting in India, email and messaging providers, payment gateways) under written contracts, with government portals when you file returns, and with professionals from our network when you engage them. We do not sell personal data."] },
    { heading: "6. Retention", body: ["Account data is retained while your account is active and for 90 days after closure. Financial records may be retained longer where required by law (for example, eight years under the Companies Act, 2013). Backups are purged on a rolling schedule."] },
    { heading: "7. Your rights", body: ["You may access, correct, update or request erasure of your personal data, nominate a person to exercise your rights, and raise a grievance. Contact our Grievance Officer at privacy@allyouneed.in; we respond within 30 days. You may escalate to the Data Protection Board of India."] },
    { heading: "8. Security", body: ["Data is encrypted in transit and at rest, access is role-based and logged, and we run regular vulnerability assessments. Our practices are designed to align with ISO 27001 and SOC 2 control frameworks."] },
    { heading: "9. Cookies", body: ["We use strictly necessary cookies for login and preferences, and analytics cookies only with consent. You can manage cookies in your browser settings."] },
    { heading: "10. Changes", body: ["We will notify account holders by email of material changes at least 15 days before they take effect."] },
  ],
};
```

`content/legal/refund.ts`:
```ts
import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const refundDoc: LegalDoc = {
  title: "Refund Policy",
  updated: "2026-09-27",
  intro: "We want you to pay only for software you use. This policy explains when subscription fees are refunded.",
  sections: [
    { heading: "1. Free trial", body: ["Paid plans start with a 14-day free trial. You will not be charged until the trial ends, and you can cancel any time during the trial without charge."] },
    { heading: "2. Monthly plans", body: ["Monthly subscriptions can be cancelled any time and remain active until the end of the paid month. Fees for the current month are not refunded, and no further charges are made."] },
    { heading: "3. Yearly plans", body: ["Yearly subscriptions cancelled within 30 days of the first payment are refunded in full. After 30 days we refund the unused whole months remaining, less the discount received compared with monthly pricing."] },
    { heading: "4. Professional services", body: ["Fees for filings, audits or advisory delivered by professionals from our network are refundable only if the work has not started. Government fees and penalties are never refundable."] },
    { heading: "5. Service failures", body: ["If we miss our uptime commitment in a month, you may request a service credit as described in your plan's SLA."] },
    { heading: "6. How to request a refund", body: ["Email billing@allyouneed.in from your registered address with your organisation name and invoice number. Approved refunds are processed to the original payment method within 7–10 working days."] },
  ],
};
```

`content/legal/index.ts`:
```ts
export { termsDoc } from "./terms";
export { privacyDoc } from "./privacy";
export { refundDoc } from "./refund";
export type { LegalDoc, LegalSection } from "./types";
```

- [ ] **Step 9: Run the integrity test, typecheck and lint**

Run: `npx vitest run tests/content` → all pass. If an icon import fails typecheck (`has no exported member`), open `node_modules/lucide-react/dist/lucide-react.d.ts`, search for the closest name and substitute it — the integrity test's `expect(m.icon).toBeDefined()` guards against undefined icons.

Run: `npm run typecheck`, `npm run lint` → clean.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(content): add all site copy as typed data with integrity tests" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 5: Validation schemas, pricing maths, form transport

**Files:**
- Create: `lib/schemas.ts`, `lib/pricing.ts`, `lib/forms.ts`, `tests/lib/schemas.test.ts`, `tests/lib/pricing.test.ts`, `tests/lib/forms.test.ts`

**Interfaces:**
- Produces: `contactSchema`, `newsletterSchema`, `loginSchema`, `registerSchema` (zod) + inferred types `ContactInput`, `NewsletterInput`, `LoginInput`, `RegisterInput`; `teamSizes` and `INDIAN_MOBILE` regex; `formatInr(n: number): string`, `yearlyMonthlyEquivalent(monthly: number): number`, `yearlyTotal(monthly: number): number`, `priceFor(plan: Plan, billing: Billing): { amount: number | null; note: string }`, `type Billing = "monthly" | "yearly"`, `YEARLY_DISCOUNT = 0.2`; `submitForm(kind: FormKind, data: unknown): Promise<FormResult>`, `type FormKind = "contact" | "newsletter" | "login" | "register"`, `type FormResult = { ok: true } | { ok: false; error: string }`, `setFormTransport(fn | null)` for tests.

- [ ] **Step 1: Write failing tests**

`tests/lib/schemas.test.ts`:
```ts
import { describe, test, expect } from "vitest";
import { contactSchema, newsletterSchema, loginSchema, registerSchema } from "@/lib/schemas";

const validContact = {
  name: "Priya Nair",
  email: "priya@meridianfoods.in",
  phone: "9876543210",
  company: "Meridian Foods",
  teamSize: "11-50",
  modules: ["accounting", "payroll"],
  message: "",
};

describe("contactSchema", () => {
  test("accepts a valid submission", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });
  test("rejects bad email, bad phone, missing name, empty modules", () => {
    expect(contactSchema.safeParse({ ...validContact, email: "priya@" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "12345" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "5876543210" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, name: " " }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, modules: [] }).success).toBe(false);
  });
  test("phone accepts +91 and spaces and normalises to 10 digits", () => {
    const r = contactSchema.safeParse({ ...validContact, phone: "+91 98765 43210" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("9876543210");
  });
});

describe("newsletterSchema", () => {
  test("email required, phone optional", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "a@b.co", phone: "" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "a@b.co", phone: "123" }).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  test("login needs email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "secret123" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
  test("register enforces 8+ char password and required fields", () => {
    const ok = { name: "Arjun", email: "arjun@vasant.in", phone: "9123456780", company: "Vasant Interiors", password: "longenough" };
    expect(registerSchema.safeParse(ok).success).toBe(true);
    expect(registerSchema.safeParse({ ...ok, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, company: "" }).success).toBe(false);
  });
});
```

`tests/lib/pricing.test.ts`:
```ts
import { test, expect } from "vitest";
import { formatInr, yearlyMonthlyEquivalent, yearlyTotal, priceFor, YEARLY_DISCOUNT } from "@/lib/pricing";
import { plans } from "@/content/pricing";

test("formatInr uses Indian grouping and no decimals", () => {
  expect(formatInr(0)).toBe("₹0");
  expect(formatInr(999)).toBe("₹999");
  expect(formatInr(2999)).toBe("₹2,999");
  expect(formatInr(123456)).toBe("₹1,23,456");
});

test("yearly pricing saves 20%", () => {
  expect(YEARLY_DISCOUNT).toBe(0.2);
  expect(yearlyTotal(1000)).toBe(9600);
  expect(yearlyMonthlyEquivalent(1000)).toBe(800);
  expect(yearlyMonthlyEquivalent(999)).toBe(799);
});

test("priceFor returns amount and note per billing mode", () => {
  const growth = plans.find((p) => p.id === "growth")!;
  expect(priceFor(growth, "monthly")).toEqual({ amount: 999, note: "per month, billed monthly" });
  expect(priceFor(growth, "yearly")).toEqual({ amount: 799, note: "per month, ₹9,590 billed yearly" });
  const free = plans.find((p) => p.id === "free")!;
  expect(priceFor(free, "yearly")).toEqual({ amount: 0, note: "free forever" });
  const ent = plans.find((p) => p.id === "enterprise")!;
  expect(priceFor(ent, "monthly")).toEqual({ amount: null, note: "custom pricing" });
});
```

`tests/lib/forms.test.ts`:
```ts
import { test, expect, vi, afterEach } from "vitest";
import { submitForm, setFormTransport } from "@/lib/forms";

afterEach(() => {
  setFormTransport(null);
  vi.useRealTimers();
});

test("default transport resolves ok after a short delay", async () => {
  vi.useFakeTimers();
  const p = submitForm("contact", { name: "x" });
  await vi.advanceTimersByTimeAsync(800);
  await expect(p).resolves.toEqual({ ok: true });
});

test("a custom transport can fail", async () => {
  setFormTransport(async () => ({ ok: false, error: "Network down" }));
  await expect(submitForm("newsletter", { email: "a@b.co" })).resolves.toEqual({ ok: false, error: "Network down" });
});

test("transport receives kind and data", async () => {
  const spy = vi.fn(async () => ({ ok: true as const }));
  setFormTransport(spy);
  await submitForm("login", { email: "a@b.co" });
  expect(spy).toHaveBeenCalledWith("login", { email: "a@b.co" });
});
```

Run: `npx vitest run tests/lib`
Expected: FAIL — modules not found (the `cn`/`motion` tests from Task 2 still pass).

- [ ] **Step 2: Implement `lib/schemas.ts`**

```ts
import { z } from "zod";

export const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/** Accepts "+91 98765 43210", "098765 43210", "9876543210"; outputs 10 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, ""))
  .refine((v) => INDIAN_MOBILE.test(v), { message: "Enter a valid 10-digit Indian mobile number" });

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, "") : ""))
  .refine((v) => v === "" || INDIAN_MOBILE.test(v), { message: "Enter a valid 10-digit Indian mobile number" });

// Trim/lowercase BEFORE validating: z.email().trim() would reject "  a@b.co " (verified against zod 4.6).
const email = z.string().trim().toLowerCase().pipe(z.email({ message: "Enter a valid work email" }));

const requiredText = (label: string, min = 2) =>
  z.string().trim().min(min, { message: `Enter your ${label}` });

export const teamSizes = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const contactSchema = z.object({
  name: requiredText("name"),
  email,
  phone: phoneSchema,
  company: requiredText("company name"),
  teamSize: z.enum(teamSizes, { message: "Choose your team size" }),
  modules: z.array(z.string()).min(1, { message: "Pick at least one module" }),
  message: z.string().trim().max(2000, { message: "Keep it under 2000 characters" }).optional().default(""),
});

export const newsletterSchema = z.object({
  email,
  phone: optionalPhone,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password" }),
});

export const registerSchema = z.object({
  name: requiredText("name"),
  email,
  phone: phoneSchema,
  company: requiredText("company name"),
  password: z.string().min(8, { message: "Use at least 8 characters" }),
});

// Forms use useForm<Input, unknown, Output>: Input is what the fields hold, Output is what zod hands to onSubmit after transforms.
export type ContactInput = z.input<typeof contactSchema>;
export type ContactOutput = z.output<typeof contactSchema>;
export type NewsletterInput = z.input<typeof newsletterSchema>;
export type NewsletterOutput = z.output<typeof newsletterSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;
```

- [ ] **Step 3: Implement `lib/pricing.ts`**

```ts
import type { Plan } from "@/content/pricing";

export type Billing = "monthly" | "yearly";

export const YEARLY_DISCOUNT = 0.2;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatInr(n: number) {
  return inr.format(n);
}

export function yearlyTotal(monthly: number) {
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));
}

export function yearlyMonthlyEquivalent(monthly: number) {
  return Math.round(monthly * (1 - YEARLY_DISCOUNT));
}

export function priceFor(plan: Plan, billing: Billing): { amount: number | null; note: string } {
  if (plan.monthly === null) return { amount: null, note: "custom pricing" };
  if (plan.monthly === 0) return { amount: 0, note: "free forever" };
  if (billing === "monthly") return { amount: plan.monthly, note: "per month, billed monthly" };
  return {
    amount: yearlyMonthlyEquivalent(plan.monthly),
    note: `per month, ${formatInr(yearlyTotal(plan.monthly))} billed yearly`,
  };
}
```

- [ ] **Step 4: Implement `lib/forms.ts`**

```ts
export type FormKind = "contact" | "newsletter" | "login" | "register";
export type FormResult = { ok: true } | { ok: false; error: string };
export type FormTransport = (kind: FormKind, data: unknown) => Promise<FormResult>;

/**
 * The ONLY place form submissions leave the browser.
 * Today: no backend — wait briefly and succeed.
 * Later: replace the body with a fetch() to Formspree / an API route.
 */
const defaultTransport: FormTransport = async () => {
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true };
};

let transport: FormTransport = defaultTransport;

/** Test hook: inject a transport, or pass null to restore the default. */
export function setFormTransport(fn: FormTransport | null) {
  transport = fn ?? defaultTransport;
}

export function submitForm(kind: FormKind, data: unknown): Promise<FormResult> {
  return transport(kind, data);
}
```

- [ ] **Step 5: Run tests, typecheck, lint**

Run: `npx vitest run tests/lib` → all pass (if `formatInr` output uses a non-breaking space or a different rupee glyph in your Node's ICU, adjust the test expectations to the actual output — Node 24 with full ICU prints `₹2,999`).
Run: `npm run typecheck` and `npm run lint` → clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(lib): add zod schemas, INR pricing helpers and form transport stub" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 6: UI primitives (Container, Section, SectionHeading, Button, Card, Badge, form controls, Tabs, Accordion)

**Files:**
- Create: `components/ui/Container.tsx`, `components/ui/Section.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/Button.tsx`, `components/ui/Card.tsx`, `components/ui/Badge.tsx`, `components/ui/Field.tsx`, `components/ui/Input.tsx`, `components/ui/Textarea.tsx`, `components/ui/Select.tsx`, `components/ui/Checkbox.tsx`, `components/ui/Tabs.tsx`, `components/ui/Accordion.tsx`, `tests/components/ui/Button.test.tsx`, `tests/components/ui/Field.test.tsx`, `tests/components/ui/Tabs.test.tsx`, `tests/components/ui/Accordion.test.tsx`

**Interfaces:**
- Produces:
  - `<Container className?>`; `<Section id? tone?: "default" | "surface" className?>`; `<SectionHeading eyebrow? title lead? align?: "center" | "left" as?: "h1" | "h2" className?>`
  - `<Button variant?: "primary" | "secondary" | "ghost" | "outline" size?: "sm" | "md" | "lg" href? arrow? className? ...buttonProps>` — renders `Link` when `href`; `arrow` appends an `ArrowRight` icon that nudges right on hover; primary has a shine sweep.
  - `<Card hover? className? as?>`; `<Badge tone?: "primary" | "accent" | "neutral" | "success" className?>`
  - `<Field id label error? hint? required? children>` — children receive `id`, `aria-invalid`, `aria-describedby` via `cloneElement`.
  - `Input`, `Textarea`, `Select`, `Checkbox` (forwardRef; `Select` takes `options: {value,label}[]` + `placeholder`; `Checkbox` takes `label`).
  - `<Tabs tabs: {id: string; label: string}[] value onChange(id) indicator?: ReactNode ariaLabel className>` (WAI-ARIA tablist, roving tabindex, Arrow/Home/End keys). Panels are rendered by the caller with `role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab`}`.
  - `<Accordion items: {id; q; a}[] defaultOpen?: string>` (one open at a time; `aria-expanded`/`aria-controls`).

- [ ] **Step 1: Write failing tests**

`tests/components/ui/Button.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

test("renders a link when href is given", () => {
  render(<Button href="/pricing/">See pricing</Button>);
  expect(screen.getByRole("link", { name: "See pricing" })).toHaveAttribute("href", "/pricing/");
});

test("renders a button otherwise and forwards type", () => {
  render(<Button type="submit">Send</Button>);
  expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
});

test("arrow adds a decorative icon", () => {
  const { container } = render(<Button arrow>Go</Button>);
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});
```

`tests/components/ui/Field.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

test("links label, error and describedby to the control", () => {
  render(
    <Field id="email" label="Work email" error="Enter a valid work email">
      <Input type="email" />
    </Field>
  );
  const input = screen.getByLabelText("Work email");
  expect(input).toHaveAttribute("id", "email");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "email-error");
  expect(screen.getByText("Enter a valid work email")).toHaveAttribute("id", "email-error");
});

test("no error means aria-invalid false and hint is described", () => {
  render(
    <Field id="phone" label="Phone" hint="10 digits">
      <Input />
    </Field>
  );
  const input = screen.getByLabelText("Phone");
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(input).toHaveAttribute("aria-describedby", "phone-hint");
});
```

`tests/components/ui/Tabs.test.tsx`:
```tsx
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "accounting", label: "Accounting" },
  { id: "crm", label: "CRM" },
];

function Harness({ onChange }: { onChange?: (id: string) => void }) {
  const [value, setValue] = useState("dashboard");
  return (
    <Tabs
      tabs={tabs}
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange?.(id);
      }}
      ariaLabel="Modules"
    />
  );
}

test("has tablist semantics and roving tabindex", () => {
  render(<Harness />);
  expect(screen.getByRole("tablist", { name: "Modules" })).toBeInTheDocument();
  const [a, b] = screen.getAllByRole("tab");
  expect(a).toHaveAttribute("aria-selected", "true");
  expect(a).toHaveAttribute("tabindex", "0");
  expect(b).toHaveAttribute("aria-selected", "false");
  expect(b).toHaveAttribute("tabindex", "-1");
  expect(a).toHaveAttribute("id", "dashboard-tab");
  expect(a).toHaveAttribute("aria-controls", "dashboard-panel");
});

test("arrow keys, Home and End move selection and focus", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Harness onChange={onChange} />);
  const tabsEls = screen.getAllByRole("tab");
  tabsEls[0].focus();
  await user.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenLastCalledWith("accounting");
  expect(screen.getAllByRole("tab")[1]).toHaveFocus();
  await user.keyboard("{End}");
  expect(onChange).toHaveBeenLastCalledWith("crm");
  await user.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenLastCalledWith("dashboard");
  await user.keyboard("{Home}");
  expect(onChange).toHaveBeenLastCalledWith("dashboard");
  await user.keyboard("{ArrowLeft}");
  expect(onChange).toHaveBeenLastCalledWith("crm");
});

test("click selects", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole("tab", { name: "CRM" }));
  expect(screen.getByRole("tab", { name: "CRM" })).toHaveAttribute("aria-selected", "true");
});
```

`tests/components/ui/Accordion.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "@/components/ui/Accordion";

const items = [
  { id: "a", q: "Is there a free plan?", a: "Yes, up to five users." },
  { id: "b", q: "Where is data stored?", a: "In India." },
];

test("one item open at a time, with aria wiring", async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  const [first, second] = screen.getAllByRole("button");
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(first).toHaveAttribute("aria-controls", "a-panel");
  await user.click(first);
  expect(first).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Yes, up to five users.")).toBeInTheDocument();
  await user.click(second);
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(second).toHaveAttribute("aria-expanded", "true");
  await user.click(second);
  expect(second).toHaveAttribute("aria-expanded", "false");
});

test("defaultOpen opens an item", () => {
  render(<Accordion items={items} defaultOpen="b" />);
  expect(screen.getByRole("button", { name: /where is data stored/i })).toHaveAttribute("aria-expanded", "true");
});
```

Run: `npx vitest run tests/components/ui`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement layout primitives**

`components/ui/Container.tsx`:
```tsx
import { cn } from "@/lib/cn";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
```

`components/ui/Section.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  id?: string;
  tone?: "default" | "surface";
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, tone = "default", className, children }: Props) {
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-28", tone === "surface" && "bg-surface", className)}
    >
      {children}
    </section>
  );
}
```

`components/ui/SectionHeading.tsx`:
```tsx
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ eyebrow, title, lead, align = "center", as: Tag = "h2", className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow ? (
        <Badge tone="primary" className="mb-4">
          {eyebrow}
        </Badge>
      ) : null}
      <Tag className={cn("font-display font-bold tracking-tight text-text", Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl")}>
        {title}
      </Tag>
      {lead ? <p className="mt-4 text-lg text-text-muted sm:text-xl">{lead}</p> : null}
    </div>
  );
}
```

- [ ] **Step 3: Implement Button, Card, Badge**

`components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type LinkProps = BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">;
type ButtonProps = BaseProps & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-[transform,box-shadow,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift",
  secondary: "bg-text text-background hover:-translate-y-0.5 hover:shadow-lift dark:bg-white dark:text-[#0B1020]",
  outline: "border border-border bg-background/60 text-text backdrop-blur hover:border-primary hover:text-primary",
  ghost: "text-text hover:bg-primary-soft hover:text-primary",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-base",
  lg: "h-13 px-7 text-base",
};

export function Button(props: LinkProps | ButtonProps) {
  const { variant = "primary", size = "md", arrow, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const inner = (
    <>
      {variant === "primary" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] skew-x-[-12deg] bg-white/25 group-hover:animate-shine"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {arrow ? (
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        ) : null}
      </span>
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {inner}
      </Link>
    );
  }

  const { type = "button", ...btnRest } = rest as ButtonProps;
  return (
    <button type={type} className={classes} {...btnRest}>
      {inner}
    </button>
  );
}
```

`components/ui/Card.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  hover?: boolean;
  className?: string;
  as?: "div" | "article" | "li";
  children: React.ReactNode;
};

export function Card({ hover, className, as: Tag = "div", children }: Props) {
  return (
    <Tag
      className={cn(
        "relative rounded-2xl border border-border bg-background p-6 shadow-soft",
        hover && "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift",
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

`components/ui/Badge.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Tone = "primary" | "accent" | "neutral" | "success";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent/15 text-[#854F0B] dark:text-accent",
  neutral: "bg-surface text-text-muted border border-border",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function Badge({ tone = "primary", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Implement form controls and Field**

`components/ui/Field.tsx`:
```tsx
import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<Record<string, unknown>>;
};

export function Field({ id, label, error, hint, required, className, children }: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": error ? "true" : "false", "aria-describedby": describedBy, "aria-required": required ? "true" : undefined })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
```

`components/ui/Input.tsx`:
```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-text placeholder:text-text-muted/70 shadow-[inset_0_1px_2px_rgb(0_0_0/0.03)] transition-[border-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-red-500 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
});
```

`components/ui/Textarea.tsx`:
```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { inputClasses } from "./Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputClasses, "h-auto min-h-28 py-3", className)} {...props} />;
});
```

`components/ui/Select.tsx`:
```tsx
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputClasses } from "./Input";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select({ className, options, placeholder, ...props }, ref) {
  // With only a disabled placeholder the browser falls back to the first enabled option; start on the placeholder instead.
  const placeholderDefault =
    placeholder !== undefined && props.value === undefined && props.defaultValue === undefined ? "" : undefined;
  return (
    <div className="relative">
      <select ref={ref} defaultValue={placeholderDefault} className={cn(inputClasses, "appearance-none pr-10", className)} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
});
```

`components/ui/Checkbox.tsx`:
```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox({ className, label, id, ...props }, ref) {
  return (
    <label htmlFor={id} className={cn("group inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary hover:border-primary/50", className)}>
      <input ref={ref} id={id} type="checkbox" className="size-4 accent-[var(--primary)]" {...props} />
      {label}
    </label>
  );
});
```

- [ ] **Step 5: Implement Tabs and Accordion**

`components/ui/Tabs.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: string };

type Props = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  indicator?: React.ReactNode; // rendered inside the active tab (e.g. a layoutId pill)
  className?: string;
  tabClassName?: string;
};

export function Tabs({ tabs, value, onChange, ariaLabel, indicator, className, tabClassName }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      Home: () => select(0),
      End: () => select(tabs.length - 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("relative flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1", className)}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${t.id}-tab`}
            type="button"
            aria-selected={active}
            aria-controls={`${t.id}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative isolate rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
              active ? "text-white" : "text-text-muted hover:text-text",
              tabClassName
            )}
          >
            {active ? indicator : null}
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

`components/ui/Accordion.tsx` — panels animate `height` (the one deliberate exception to the transform/opacity rule; it is scoped to accordion panels):
```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";

export type AccordionItem = { id: string; q: string; a: string };

export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={cn("divide-y divide-border rounded-2xl border border-border bg-background", className)}>
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={`${item.id}-trigger`}
                aria-expanded={expanded}
                aria-controls={`${item.id}-panel`}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-text transition-colors hover:text-primary"
              >
                {item.q}
                <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0 text-text-muted transition-transform duration-300", expanded && "rotate-180 text-primary")} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? (
                <m.div
                  key="panel"
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={`${item.id}-trigger`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: duration.base, ease }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-text-muted">{item.a}</p>
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run tests/components/ui` → all pass. `npm run typecheck`, `npm run lint` → clean. (If ESLint flags the `h-13` class, it is fine — Tailwind 4 generates arbitrary spacing steps; if it does not render 3.25rem at runtime, replace with `h-[3.25rem]`.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): add layout, button, card, badge, form control, tabs and accordion primitives" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Motion primitives

**Files:**
- Create: `components/motion/Reveal.tsx`, `components/motion/Stagger.tsx`, `components/motion/SplitWords.tsx`, `components/motion/CountUp.tsx`, `components/motion/RollingNumber.tsx`, `components/motion/Marquee.tsx`, `components/motion/TiltCard.tsx`, `components/motion/SpotlightCard.tsx`, `components/motion/MagneticButton.tsx`, `components/motion/ScrollProgress.tsx`, `components/motion/BackToTop.tsx`, `components/motion/AuroraBackground.tsx`, `components/motion/CursorSpotlight.tsx`, `lib/useInteractive.ts`, `tests/components/motion/Reveal.test.tsx`, `tests/components/motion/CountUp.test.tsx`, `tests/components/motion/Marquee.test.tsx`, `tests/components/motion/RollingNumber.test.tsx`, `tests/components/motion/SplitWords.test.tsx`

**Interfaces:**
- Consumes: `lib/motion.ts` tokens (Task 2), `cn`.
- Produces:
  - `useInteractive(): boolean` — true only when hover is available AND reduced motion is off (client-side; false during SSR).
  - `<Reveal as? variant?: "fadeUp" | "fadeIn" | "scaleIn" delay? className? children>`; `<Stagger gap? className? children>` + `<StaggerItem className? children>`
  - `<SplitWords text as?: "h1" | "h2" | "p" className? delay? highlightLast?: number>` — heading with `aria-label={text}`, words animate in.
  - `<CountUp value suffix? prefix? decimals? duration? className>`; `<RollingNumber value format?: (n) => string className>`
  - `<Marquee speed?: number pauseOnHover? className children>`; `<TiltCard max? className children>`; `<SpotlightCard id? as?: "div" | "article" | "li" | "a" href? className children>`; `<MagneticButton strength? className children>`
  - `<ScrollProgress />`, `<BackToTop />`, `<AuroraBackground className? />`, `<CursorSpotlight />`

- [ ] **Step 1: Write failing tests**

`tests/components/motion/Reveal.test.tsx`:
```tsx
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("motion/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("motion/react")>();
  return { ...mod, useReducedMotion: () => true };
});

import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

test("under reduced motion Reveal renders content visible with data-reveal", () => {
  render(
    <Reveal>
      <p>Visible now</p>
    </Reveal>
  );
  const wrapper = screen.getByText("Visible now").parentElement!;
  expect(wrapper).toHaveAttribute("data-reveal");
  expect(wrapper.getAttribute("style") ?? "").not.toMatch(/opacity:\s*0/);
});

test("Stagger renders all children", () => {
  render(
    <Stagger>
      <StaggerItem>One</StaggerItem>
      <StaggerItem>Two</StaggerItem>
    </Stagger>
  );
  expect(screen.getByText("One")).toBeInTheDocument();
  expect(screen.getByText("Two")).toBeInTheDocument();
});
```

`tests/components/motion/CountUp.test.tsx`:
```tsx
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("motion/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("motion/react")>();
  return { ...mod, useReducedMotion: () => true };
});

import { CountUp } from "@/components/motion/CountUp";

test("reduced motion shows the final formatted value immediately", () => {
  render(<CountUp value={40} suffix="K+" />);
  expect(screen.getByText("40K+")).toBeInTheDocument();
});

test("respects decimals", () => {
  render(<CountUp value={99.9} suffix="%" decimals={1} />);
  expect(screen.getByText("99.9%")).toBeInTheDocument();
});
```

`tests/components/motion/Marquee.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Marquee } from "@/components/motion/Marquee";

test("duplicates children for a seamless loop and hides the copy from AT", () => {
  render(
    <Marquee>
      <span>Meridian Foods</span>
    </Marquee>
  );
  expect(screen.getAllByText("Meridian Foods")).toHaveLength(2);
  const copies = document.querySelectorAll("[aria-hidden='true']");
  expect(copies.length).toBeGreaterThanOrEqual(1);
});
```

`tests/components/motion/RollingNumber.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { formatInr } from "@/lib/pricing";

test("exposes the formatted value as its label", () => {
  render(<RollingNumber value={2999} format={formatInr} />);
  expect(screen.getByLabelText("₹2,999")).toBeInTheDocument();
});
```

`tests/components/motion/SplitWords.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplitWords } from "@/components/motion/SplitWords";

test("renders an accessible heading with the full sentence", () => {
  render(<SplitWords as="h1" text="Everything your business runs on. One OS." highlightLast={2} />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/motion`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement `lib/useInteractive.ts`, Reveal, Stagger, SplitWords**

`lib/useInteractive.ts` (media-query detection via `useSyncExternalStore` — no state setter in an effect):
```ts
"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(HOVER_QUERY).matches;
const getServerSnapshot = () => false;

/** True only on devices with a hover pointer and no reduced-motion preference. False during SSR. */
export function useInteractive() {
  const hover = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduce = useReducedMotion();
  return hover && !reduce;
}
```

`components/motion/Reveal.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { fadeUp, fadeIn, scaleIn, viewport } from "@/lib/motion";
import { cn } from "@/lib/cn";

const variantsMap = { fadeUp, fadeIn, scaleIn };

type Props = {
  as?: "div" | "section" | "li" | "article" | "span";
  variant?: keyof typeof variantsMap;
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ as = "div", variant = "fadeUp", delay = 0, className, children }: Props) {
  const reduce = useReducedMotion();
  const Comp = m[as];

  if (reduce) {
    const Plain = as;
    return (
      <Plain data-reveal className={className}>
        {children}
      </Plain>
    );
  }

  const v = variantsMap[variant];
  return (
    <Comp
      data-reveal
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ hidden: v.hidden, show: { ...v.show, transition: { ...v.show.transition, delay } } }}
    >
      {children}
    </Comp>
  );
}
```

`components/motion/Stagger.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { fadeUp, staggerContainer, viewport } from "@/lib/motion";

export function Stagger({ gap, className, children }: { gap?: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <m.div className={className} variants={staggerContainer(gap)} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </m.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} data-reveal>{children}</div>;
  return (
    <m.div className={className} variants={fadeUp} data-reveal>
      {children}
    </m.div>
  );
}
```

`components/motion/SplitWords.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Props = {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  delay?: number;
  highlightLast?: number; // number of trailing words to render with the brand gradient
};

export function SplitWords({ text, as: Tag = "h1", className, delay = 0, highlightLast = 0 }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const firstHighlight = words.length - highlightLast;

  return (
    <Tag aria-label={text} className={cn(className)}>
      {words.map((word, i) => {
        const highlighted = i >= firstHighlight;
        return (
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <m.span
              data-reveal
              className={cn("inline-block will-change-transform", highlighted && "text-gradient")}
              initial={reduce ? false : { opacity: 0, y: "60%", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: delay + i * 0.06 }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </m.span>
          </span>
        );
      })}
    </Tag>
  );
}
```

- [ ] **Step 3: Implement CountUp, RollingNumber, Marquee**

`components/motion/CountUp.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string };

export function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease,
      onUpdate: (v) => {
        // Written straight to the DOM (no React state) so a 60fps count never re-renders.
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {reduce ? format(value) : format(0)}
    </span>
  );
}
```

`components/motion/RollingNumber.tsx` — each digit is a column of 0–9 that slides to the right row with a spring; non-digit characters (₹ , .) render statically:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

type Props = { value: number; format?: (n: number) => string; className?: string };

const digits = Array.from({ length: 10 }, (_, i) => i);

export function RollingNumber({ value, format = (n) => String(n), className }: Props) {
  const reduce = useReducedMotion();
  const text = format(value);

  if (reduce) {
    return (
      <span aria-label={text} className={className}>
        {text}
      </span>
    );
  }

  return (
    <span aria-label={text} className={cn("inline-flex overflow-hidden leading-none", className)}>
      {text.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={`${i}-${ch}`} aria-hidden="true" className="inline-block">
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        return (
          <span key={`${i}-col`} aria-hidden="true" className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <m.span
              className="absolute left-0 top-0 flex flex-col items-center"
              animate={{ y: `-${d}em` }}
              transition={{ ...spring, stiffness: 220, damping: 26 }}
            >
              {digits.map((n) => (
                <span key={n} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </m.span>
          </span>
        );
      })}
    </span>
  );
}
```

`components/motion/Marquee.tsx`:
```tsx
"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Props = { speed?: number; pauseOnHover?: boolean; className?: string; children: React.ReactNode };

export function Marquee({ speed = 40, pauseOnHover = true, className, children }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn("flex flex-wrap justify-center gap-x-10 gap-y-4", className)}>{children}</div>;
  }

  return (
    <div className={cn("group relative overflow-hidden mask-fade-x", className)}>
      <div
        className={cn("flex w-max animate-marquee gap-10 pr-10", pauseOnHover && "group-hover:[animation-play-state:paused]")}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement TiltCard, SpotlightCard, MagneticButton**

`components/motion/TiltCard.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";
import { cn } from "@/lib/cn";

type Props = { max?: number; className?: string; children: React.ReactNode };

export function TiltCard({ max = 8, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const interactive = useInteractive();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * max * 2);
    ry.set(px * max * 2);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className="perspective">
      <m.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={interactive ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        className={cn("will-change-transform", className)}
      >
        {children}
      </m.div>
    </div>
  );
}
```

`components/motion/SpotlightCard.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type Props = { id?: string; className?: string; as?: "div" | "article" | "li" | "a"; href?: string; children: React.ReactNode };

export function SpotlightCard({ id, className, as = "div", href, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      id={id}
      href={href}
      onMouseMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-soft transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift [--x:50%] [--y:50%]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), color-mix(in srgb, var(--primary) 16%, transparent), transparent 60%)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
        style={{ background: "radial-gradient(300px circle at var(--x) var(--y), var(--primary), transparent 70%)" }}
      />
      <span className="relative z-10 block">{children}</span>
    </Tag>
  );
}
```

`components/motion/MagneticButton.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";

type Props = { strength?: number; className?: string; children: React.ReactNode };

export function MagneticButton({ strength = 0.25, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const interactive = useInteractive();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 24 });
  const y = useSpring(my, { stiffness: 300, damping: 24 });

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <m.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={interactive ? { x, y } : undefined} className={className}>
      {children}
    </m.div>
  );
}
```

- [ ] **Step 5: Implement ScrollProgress, BackToTop, AuroraBackground, CursorSpotlight**

`components/motion/ScrollProgress.tsx`:
```tsx
"use client";

import { m, useScroll, useSpring, useReducedMotion } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[90] h-0.5 origin-left bg-gradient-to-r from-primary to-accent"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}
```

`components/motion/BackToTop.tsx`:
```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { spring } from "@/lib/motion";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > window.innerHeight));

  const toTop = () => {
    if (lenis && !reduce) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show ? (
        <m.button
          key="top"
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={spring}
          className="fixed bottom-6 right-6 z-[80] grid size-11 place-items-center rounded-full border border-border bg-background/80 text-text shadow-lift backdrop-blur transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
```

`components/motion/AuroraBackground.tsx`:
```tsx
import { cn } from "@/lib/cn";

/** Slow-drifting indigo/amber blobs over a faint dot grid. Pure CSS; keyframes disabled under reduced motion in globals.css. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full bg-primary/30 blur-3xl animate-aurora" />
      <div className="absolute -right-1/4 top-1/3 h-[60vh] w-[60vw] rounded-full bg-accent/20 blur-3xl animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-0 left-1/3 h-[50vh] w-[50vw] rounded-full bg-[#7F77DD]/25 blur-3xl animate-aurora [animation-delay:-12s]" />
    </div>
  );
}
```

`components/motion/CursorSpotlight.tsx` (the glow is painted once and moved with `transform` — never animate `background`):
```tsx
"use client";

import { useEffect } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";

// Diameter of the pre-rendered glow. It is painted once; only transform and opacity change per frame.
const SIZE = 1200;

export function CursorSpotlight() {
  const interactive = useInteractive();
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const sx = useSpring(x, { stiffness: 120, damping: 24 });
  const sy = useSpring(y, { stiffness: 120, damping: 24 });
  const opacity = useMotionValue(0);

  useEffect(() => {
    if (!interactive) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
      opacity.set(1);
    };
    const leave = () => opacity.set(0);
    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [interactive, x, y, opacity]);

  if (!interactive) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <m.div
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          x: sx,
          y: sy,
          opacity,
          width: SIZE,
          height: SIZE,
          background: "radial-gradient(circle closest-side, color-mix(in srgb, var(--primary) 10%, transparent), transparent)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run tests/components/motion` → all pass. `npm run typecheck`, `npm run lint` → clean (no `eslint-disable` comments anywhere).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(motion): add reveal, stagger, split words, count-up, rolling number, marquee, tilt, spotlight, magnetic, scroll progress, back-to-top, aurora, cursor spotlight" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 8: Site chrome — ThemeToggle, Navbar, MobileNav, Footer (+ FormStatus, NewsletterForm)

**Files:**
- Create: `components/layout/ThemeToggle.tsx`, `components/layout/Navbar.tsx`, `components/layout/MobileNav.tsx`, `components/layout/Footer.tsx`, `components/forms/FormStatus.tsx`, `components/forms/NewsletterForm.tsx`, `tests/components/layout/Navbar.test.tsx`, `tests/components/layout/ThemeToggle.test.tsx`, `tests/components/layout/Footer.test.tsx`, `tests/components/forms/NewsletterForm.test.tsx`
- Modify: `app/layout.tsx` (mount Navbar + Footer around `<main id="main">`)

**Interfaces:**
- Consumes: `mainNav`, `footerColumns`, `compliance`, `site` (Task 4); `Logo` (Task 3); `Button`, `Container`, `Field`, `Input` (Task 6); `newsletterSchema`, `submitForm` (Task 5); `spring`, `ease`, `duration` (Task 2).
- Produces: `<ThemeToggle />`, `<Navbar />`, `<MobileNav open onClose links />`, `<Footer />`, `<FormStatus state: FormState error? successTitle successBody onRetry />` where `type FormState = "idle" | "submitting" | "success" | "error"`, `<NewsletterForm />`. Root layout renders `<Navbar />`, `<main id="main" className="flex-1">{children}</main>`, `<Footer />`.

- [ ] **Step 1: Write failing tests**

`tests/components/layout/ThemeToggle.test.tsx`:
```tsx
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme }),
}));

import { ThemeToggle } from "@/components/layout/ThemeToggle";

test("switches to dark from light", async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);
  const btn = await screen.findByRole("button", { name: /switch to dark mode/i });
  await user.click(btn);
  expect(setTheme).toHaveBeenCalledWith("dark");
});
```

`tests/components/layout/Navbar.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/Navbar";

test("renders primary navigation, login and CTA", () => {
  render(<Navbar />);
  const nav = screen.getByRole("navigation", { name: /primary/i });
  expect(nav).toBeInTheDocument();
  for (const label of ["Features", "Tax & Compliance", "Pricing", "About", "Contact"]) {
    expect(screen.getAllByRole("link", { name: label })[0]).toBeInTheDocument();
  }
  expect(screen.getAllByRole("link", { name: "Log in" })[0]).toHaveAttribute("href", "/login/");
  expect(screen.getAllByRole("link", { name: "Start free" })[0]).toHaveAttribute("href", "/register/");
});

test("mobile menu opens and closes with Escape", async () => {
  const user = userEvent.setup();
  render(<Navbar />);
  const open = screen.getByRole("button", { name: /open menu/i });
  expect(open).toHaveAttribute("aria-expanded", "false");
  await user.click(open);
  expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

`tests/components/layout/Footer.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

test("renders link columns, compliance alignment note and newsletter", () => {
  render(<Footer />);
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Product" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy/");
  expect(screen.getByText(/designed to align with/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
  expect(screen.getByText(/© \d{4} Allyouneed/)).toBeInTheDocument();
});
```

`tests/components/forms/NewsletterForm.test.tsx`:
```tsx
import { test, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("shows a validation error for a bad email", async () => {
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "nope");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/valid work email/i);
});

test("submits and shows success", async () => {
  setFormTransport(async () => ({ ok: true }));
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  await waitFor(() => expect(screen.getByText(/you're on the list/i)).toBeInTheDocument());
});

test("shows error state with retry", async () => {
  setFormTransport(async () => ({ ok: false, error: "Something went wrong" }));
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/layout tests/components/forms`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement ThemeToggle (icon morph + View Transitions circular reveal)**

`components/layout/ThemeToggle.tsx`:
```tsx
"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

// Hydration-safe "mounted" flag without a state setter in an effect: false on the server, true on the client.
const noopSubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  const toggle = async () => {
    const doc = document as DocWithVT;
    if (!doc.startViewTransition || reduce || !ref.current) {
      setTheme(next);
      return;
    }
    const r = ref.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    await transition.ready;
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  };

  if (!mounted) {
    return <span aria-hidden="true" className={cn("inline-block size-10 rounded-full border border-border", className)} />;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      className={cn(
        "relative grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-background/60 text-text transition-colors hover:border-primary hover:text-primary",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="grid place-items-center"
        >
          {isDark ? <Moon aria-hidden="true" className="size-[18px]" /> : <Sun aria-hidden="true" className="size-[18px]" />}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
```

- [ ] **Step 3: Implement MobileNav and Navbar**

`components/layout/MobileNav.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import type { NavLink } from "@/content/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { ease } from "@/lib/motion";

type Props = { open: boolean; onClose: () => void; links: NavLink[] };

export function MobileNav({ open, onClose, links }: Props) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <m.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-[#0B1020]/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col bg-background p-6 shadow-lift lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between">
              <Logo href="/" />
              <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full border border-border">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
              {links.map((l, i) => (
                <m.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05, ease }}>
                  <Link ref={i === 0 ? firstLink : undefined} href={l.href} onClick={onClose} className="block rounded-xl px-3 py-3 text-lg font-medium text-text hover:bg-primary-soft hover:text-primary">
                    {l.label}
                  </Link>
                </m.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <Button href="/login/" variant="outline" onClick={onClose}>Log in</Button>
              <Button href="/register/" arrow onClick={onClose}>Start free</Button>
            </div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
```

`components/layout/Navbar.tsx`:
```tsx
"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useMotionValueEvent, useScroll, useReducedMotion } from "motion/react";
import { Menu } from "lucide-react";
import { mainNav } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(!open && y > 160 && y > prev);
  });

  // The drawer closes from its own links/buttons (MobileNav calls onClose on click), so no route-change effect is needed.
  const close = useCallback(() => setOpen(false), []);

  const isActive = (href: string) => pathname === href || pathname === href.replace(/\/$/, "");

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? -96 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease }}
      >
        <Container>
          <div
            className={cn(
              "mt-3 flex origin-top items-center justify-between rounded-full border px-3 py-2.5 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4",
              scrolled ? "glass scale-[0.985] border-border shadow-soft" : "border-transparent"
            )}
          >
            <Logo href="/" />

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {mainNav.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors", active ? "text-primary" : "text-text-muted hover:text-text")}
                  >
                    {active ? <m.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-primary-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} /> : null}
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login/" className="link-underline hidden px-2 text-sm font-medium text-text-muted hover:text-text sm:inline-block">
                Log in
              </Link>
              <MagneticButton className="hidden sm:block">
                <Button href="/register/" size="sm" arrow>Start free</Button>
              </MagneticButton>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </Container>
      </m.header>
      <MobileNav open={open} onClose={close} links={mainNav} />
    </>
  );
}
```

- [ ] **Step 4: Implement FormStatus and NewsletterForm**

`components/forms/FormStatus.tsx`:
```tsx
"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";

export type FormState = "idle" | "submitting" | "success" | "error";

type Props = { state: FormState; error?: string; successTitle: string; successBody?: string; onRetry?: () => void };

export function FormStatus({ state, error, successTitle, successBody, onRetry }: Props) {
  return (
    <AnimatePresence mode="wait">
      {state === "success" ? (
        <m.div key="ok" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <div>
            <p className="font-semibold text-text">{successTitle}</p>
            {successBody ? <p className="text-sm text-text-muted">{successBody}</p> : null}
          </div>
        </m.div>
      ) : state === "error" ? (
        <m.div key="err" role="alert" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-red-600 dark:text-red-300" />
          <p className="flex-1 text-sm text-text">{error ?? "Something went wrong."}</p>
          {onRetry ? <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button> : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
```

`components/forms/NewsletterForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { newsletterSchema, type NewsletterInput, type NewsletterOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";

export function NewsletterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState, reset } = useForm<NewsletterInput, unknown, NewsletterOutput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", phone: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setState("submitting");
    const res = await submitForm("newsletter", data);
    if (res.ok) {
      setState("success");
      reset();
    } else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="You're on the list." successBody="Product updates and compliance reminders, once a month." />;
  }

  const busy = state === "submitting";
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field id="newsletter-email" label="Work email" error={formState.errors.email?.message} className="sm:col-span-1">
          <Input type="email" placeholder="you@company.in" autoComplete="email" disabled={busy} {...register("email")} />
        </Field>
        <Field id="newsletter-phone" label="WhatsApp (optional)" error={formState.errors.phone?.message}>
          <Input type="tel" inputMode="numeric" placeholder="+91 98765 43210" autoComplete="tel" disabled={busy} {...register("phone")} />
        </Field>
      </div>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" disabled={busy} className="self-start">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
```

(`Field` clones its direct child to attach `id`/aria attributes, so the `Input` must be the direct child — never wrap it in a `<div>` inside `Field`.)

- [ ] **Step 5: Implement Footer**

`components/layout/Footer.tsx`:
```tsx
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { site } from "@/content/site";
import { footerColumns, compliance } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

// Evaluated once at build time (static export); keeps render pure.
const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo href="/" />
            <p className="mt-4 max-w-sm text-text-muted">{site.tagline} HR, payroll, accounting, CRM, inventory and tax filing for growing Indian businesses.</p>
            <div className="mt-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">Stay in the loop</h2>
              <div className="mt-3 max-w-md">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="link-underline text-text hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-background p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-text">
            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
            Designed to align with
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {compliance.map((c) => (
              <li key={c.code} title={c.label} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted">
                {c.code}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Allyouneed. All rights reserved. {site.legalName}.</p>
          <p>
            <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a> · <a href={site.phoneHref} className="link-underline">{site.phone}</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 6: Mount chrome in `app/layout.tsx`**

Replace `<Providers>{children}</Providers>` with:
```tsx
        <Providers>
          <Navbar />
          <main id="main" className="flex-1 pt-24">
            {children}
          </main>
          <Footer />
        </Providers>
```
and add imports:
```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
```

- [ ] **Step 7: Run tests, typecheck, lint, build**

Run: `npx vitest run tests/components/layout tests/components/forms` → all pass. `npm test` → all pass. `npm run typecheck`, `npm run lint` → clean. `npx next build` → compiles.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(layout): add glass navbar with hide-on-scroll, mobile drawer, theme toggle with circular reveal, footer and newsletter form" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Product mockups (frames + six self-animating module screens)

**Files:**
- Create: `components/mockups/BrowserFrame.tsx`, `components/mockups/PhoneFrame.tsx`, `components/mockups/Toasts.tsx`, `components/mockups/DashboardMock.tsx`, `components/mockups/AccountingMock.tsx`, `components/mockups/InventoryMock.tsx`, `components/mockups/PosMock.tsx`, `components/mockups/CrmMock.tsx`, `components/mockups/ItrMock.tsx`, `components/mockups/index.tsx`, `tests/components/mockups/mockups.test.tsx`

**Interfaces:**
- Consumes: `CountUp` (Task 7), `cn`, `formatInr` (Task 5), `MockupKind` (Task 4), motion tokens.
- Produces: `<BrowserFrame url? className children>`, `<PhoneFrame tone: "light" | "dark" className children>`, `<Toasts messages: string[] interval? className>`, `DashboardMock`, `AccountingMock`, `InventoryMock`, `PosMock`, `CrmMock`, `ItrMock` (each `{ compact?: boolean; className?: string }`), and `MockupFor({ kind, compact })` which maps a `MockupKind` to a component (`"none"` → `null`). All mockups animate on `whileInView` and use fictional Indian sample data.

- [ ] **Step 1: Write failing tests**

`tests/components/mockups/mockups.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { AccountingMock } from "@/components/mockups/AccountingMock";
import { InventoryMock } from "@/components/mockups/InventoryMock";
import { PosMock } from "@/components/mockups/PosMock";
import { CrmMock } from "@/components/mockups/CrmMock";
import { ItrMock } from "@/components/mockups/ItrMock";
import { MockupFor } from "@/components/mockups";

test("frames render children and chrome", () => {
  render(
    <BrowserFrame url="app.allyouneed.in/dashboard">
      <p>inside</p>
    </BrowserFrame>
  );
  expect(screen.getByText("inside")).toBeInTheDocument();
  expect(screen.getByText("app.allyouneed.in/dashboard")).toBeInTheDocument();
  render(
    <PhoneFrame tone="dark">
      <p>phone</p>
    </PhoneFrame>
  );
  expect(screen.getByText("phone")).toBeInTheDocument();
});

test("mockups render their headline content", () => {
  render(<DashboardMock />);
  expect(screen.getByText(/cash in bank/i)).toBeInTheDocument();
  render(<AccountingMock />);
  expect(screen.getByText(/trial balance/i)).toBeInTheDocument();
  render(<InventoryMock />);
  expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  render(<PosMock />);
  expect(screen.getByText(/gst 18%/i)).toBeInTheDocument();
  render(<CrmMock />);
  expect(screen.getByText(/qualified/i)).toBeInTheDocument();
  render(<ItrMock />);
  expect(screen.getByText(/filed in 4 min/i)).toBeInTheDocument();
});

test("MockupFor maps kinds and returns null for none", () => {
  const { container } = render(<MockupFor kind="none" />);
  expect(container).toBeEmptyDOMElement();
  render(<MockupFor kind="crm" compact />);
  expect(screen.getByText(/qualified/i)).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/mockups`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement frames and Toasts**

`components/mockups/BrowserFrame.tsx`:
```tsx
import { cn } from "@/lib/cn";

export function BrowserFrame({ url = "app.allyouneed.in", className, children }: { url?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-background shadow-lift", className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-center text-xs text-text-muted">{url}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
```

`components/mockups/PhoneFrame.tsx`:
```tsx
import { cn } from "@/lib/cn";

export function PhoneFrame({ tone, className, children }: { tone: "light" | "dark"; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative w-[260px] rounded-[2.4rem] border-[6px] border-[#1a1f3a] bg-[#1a1f3a] shadow-lift", className)}>
      <div className={cn("relative overflow-hidden rounded-[2rem]", tone === "dark" ? "dark bg-[#0B1020] text-[#E7E9F5]" : "bg-white text-[#0F172A]")}>
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1a1f3a]" aria-hidden="true" />
        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold">
          <span>9:41</span>
          <span aria-hidden="true">●●● ▲ ▮</span>
        </div>
        <div className="px-4 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
```

`components/mockups/Toasts.tsx` — cycles through messages while in view:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export function Toasts({ messages, interval = 3800, className }: { messages: string[]; interval?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), interval);
    return () => clearInterval(t);
  }, [inView, reduce, interval, messages.length]);

  return (
    <div ref={ref} className={cn("pointer-events-none absolute right-3 top-3 z-20", className)} aria-live="polite">
      <AnimatePresence mode="wait">
        <m.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={spring}
          className="flex items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs font-medium text-text shadow-lift backdrop-blur"
        >
          <CircleCheck aria-hidden="true" className="size-4 text-emerald-500" />
          {messages[i]}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Implement DashboardMock and AccountingMock**

`components/mockups/DashboardMock.tsx`:
```tsx
"use client";

import { m } from "motion/react";
import { TrendingUp } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Toasts } from "./Toasts";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";

const kpis = [
  { label: "Cash in bank", value: 42.6, prefix: "₹", suffix: "L", decimals: 1, delta: "+8.2%" },
  { label: "Receivables due", value: 11.3, prefix: "₹", suffix: "L", decimals: 1, delta: "-3.1%" },
  { label: "Payroll this month", value: 18.9, prefix: "₹", suffix: "L", decimals: 1, delta: "+2 hires" },
  { label: "Open leads", value: 128, prefix: "", suffix: "", decimals: 0, delta: "+14 today" },
];

const bars = [42, 58, 51, 74, 66, 88, 79, 95, 84, 102, 97, 118];
const months = ["A", "M", "J", "J", "A", "S", "O", "N", "D", "J", "F", "M"];

export function DashboardMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Toasts messages={["Invoice #1042 paid · ₹1,18,000", "GSTR-3B filed for August", "Payroll run approved · 46 employees", "New lead from Instagram: Kaveri Textiles"]} />
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] font-medium text-text-muted">{k.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-text">
              <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} />
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-300">
              <TrendingUp aria-hidden="true" className="size-3" /> {k.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text">Revenue, last 12 months</p>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">FY 2026–27</span>
          </div>
          <div className={cn("mt-3 flex items-end gap-1.5", compact ? "h-20" : "h-28")}>
            {bars.map((b, i) => (
              <m.div
                key={i}
                className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-primary to-[#7F77DD]"
                style={{ height: `${(b / 120) * 100}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={viewport}
                transition={{ duration: 0.7, ease, delay: i * 0.05 }}
              />
            ))}
          </div>
          <div className="mt-1 flex gap-1.5 text-[9px] text-text-muted">
            {months.map((mo, i) => (
              <span key={i} className="flex-1 text-center">{mo}</span>
            ))}
          </div>
        </div>
        {!compact ? (
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-text">Filing calendar</p>
            <ul className="mt-2 space-y-1.5 text-[11px]">
              {[["11 Sep", "GSTR-1", "Filed"], ["20 Sep", "GSTR-3B", "Ready"], ["30 Sep", "PT Karnataka", "Due"]].map(([d, t, s]) => (
                <li key={t} className="flex items-center justify-between rounded-lg bg-surface px-2 py-1.5">
                  <span className="text-text-muted">{d}</span>
                  <span className="font-medium text-text">{t}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", s === "Filed" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : s === "Ready" ? "bg-primary-soft text-primary" : "bg-accent/20 text-[#854F0B] dark:text-accent")}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

`components/mockups/AccountingMock.tsx`:
```tsx
"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";

const rows = [
  ["Sales — Meridian Foods", "INV-1042", "1,18,000", "Reconciled"],
  ["Purchase — Bluefin Exports", "PUR-388", "64,900", "Reconciled"],
  ["Payroll — August", "PAY-08", "18,92,400", "Posted"],
  ["GST payable — 3B", "GST-08", "2,14,760", "Ready"],
  ["Rent — Indiranagar office", "EXP-211", "1,85,000", "Reconciled"],
];

export function AccountingMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-text">Trial balance · September 2026</p>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Books balanced</span>
      </div>
      <table className="w-full text-left text-[11px]">
        <thead className="text-text-muted">
          <tr className="border-b border-border">
            <th className="px-3 py-1.5 font-medium">Entry</th>
            <th className="px-3 py-1.5 font-medium">Voucher</th>
            <th className="px-3 py-1.5 text-right font-medium">Amount (₹)</th>
            {!compact ? <th className="px-3 py-1.5 font-medium">Status</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 4 : rows.length).map((r, i) => (
            <m.tr
              key={r[1]}
              className="border-b border-border/60 last:border-0"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <td className="px-3 py-1.5 text-text">{r[0]}</td>
              <td className="px-3 py-1.5 font-mono text-text-muted">{r[1]}</td>
              <td className="px-3 py-1.5 text-right font-medium text-text">{r[2]}</td>
              {!compact ? (
                <td className="px-3 py-1.5">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", r[3] === "Reconciled" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-primary-soft text-primary")}>{r[3]}</span>
                </td>
              ) : null}
            </m.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Implement InventoryMock, PosMock, CrmMock, ItrMock**

`components/mockups/InventoryMock.tsx`:
```tsx
"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";

const items = [
  { sku: "TX-COT-42", name: "Cotton kurta, 42", stock: 184, max: 250, warehouse: "Bengaluru" },
  { sku: "TX-LIN-38", name: "Linen shirt, 38", stock: 22, max: 200, warehouse: "Hyderabad" },
  { sku: "TX-SLK-40", name: "Silk saree, plain", stock: 96, max: 120, warehouse: "Bengaluru" },
  { sku: "TX-DEN-32", name: "Denim, 32", stock: 8, max: 150, warehouse: "Chennai" },
];

export function InventoryMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-text">Stock across 3 warehouses</p>
        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-[#854F0B] dark:text-accent">2 low stock</span>
      </div>
      <ul className="divide-y divide-border/60">
        {items.slice(0, compact ? 3 : 4).map((it, i) => {
          const pct = it.stock / it.max;
          const low = pct < 0.15;
          return (
            <m.li key={it.sku} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[11px]" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.5, ease, delay: i * 0.08 }}>
              <div>
                <p className="font-medium text-text">{it.name} <span className="font-mono text-text-muted">{it.sku}</span></p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <m.div className={cn("h-full origin-left rounded-full", low ? "bg-red-500" : "bg-primary")} style={{ width: `${pct * 100}%` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={viewport} transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.08 }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text">{it.stock}</p>
                <p className="text-text-muted">{it.warehouse}</p>
              </div>
            </m.li>
          );
        })}
      </ul>
    </div>
  );
}
```

`components/mockups/PosMock.tsx`:
```tsx
"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { spring, viewport } from "@/lib/motion";

const cart = [
  { name: "Cotton kurta, 42", qty: 2, price: 1499 },
  { name: "Linen shirt, 38", qty: 1, price: 2199 },
  { name: "Silk saree, plain", qty: 1, price: 4899 },
];

export function PosMock({ compact, className }: { compact?: boolean; className?: string }) {
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return (
    <div className={cn("rounded-xl border border-border p-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text">Counter 2 · Bill #2331</p>
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">Walk-in</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {cart.slice(0, compact ? 2 : 3).map((c, i) => (
          <m.li key={c.name} className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5 text-[11px]" initial={{ opacity: 0, scale: 0.96, x: 10 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} viewport={viewport} transition={{ ...spring, delay: i * 0.1 }}>
            <span className="text-text">{c.name} <span className="text-text-muted">× {c.qty}</span></span>
            <span className="font-medium text-text">₹{fmt(c.qty * c.price)}</span>
          </m.li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-[11px]">
        <div className="flex justify-between text-text-muted"><dt>Subtotal</dt><dd>₹{fmt(subtotal)}</dd></div>
        <div className="flex justify-between text-text-muted"><dt>GST 18% (CGST 9% + SGST 9%)</dt><dd>₹{fmt(gst)}</dd></div>
        <div className="flex justify-between border-t border-border pt-1 font-display text-sm font-bold text-text"><dt>Total</dt><dd>₹{fmt(total)}</dd></div>
      </dl>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-semibold">
        <span className="rounded-lg bg-primary py-1.5 text-center text-white">UPI</span>
        <span className="rounded-lg border border-border py-1.5 text-center text-text">Card</span>
        <span className="rounded-lg border border-border py-1.5 text-center text-text">Cash</span>
      </div>
    </div>
  );
}
```

`components/mockups/CrmMock.tsx` — a lead card hops between columns every few seconds via `layoutId`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Lead = { id: string; name: string; value: string; source: string };
const columns = ["New", "Qualified", "Proposal"] as const;
const initial: Record<(typeof columns)[number], Lead[]> = {
  New: [
    { id: "l1", name: "Kaveri Textiles", value: "₹2.4L", source: "Instagram" },
    { id: "l2", name: "Arka Dental Care", value: "₹86K", source: "Website" },
  ],
  Qualified: [{ id: "l3", name: "Nimbus Logistics", value: "₹5.1L", source: "Referral" }],
  Proposal: [{ id: "l4", name: "Suryodaya Schools", value: "₹3.7L", source: "Google" }],
};

export function CrmMock({ compact, className }: { compact?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => {
      setBoard((b) => {
        const from = columns.find((c) => b[c].length > 0)!;
        const fromIdx = columns.indexOf(from);
        const to = columns[(fromIdx + 1) % columns.length];
        const [lead, ...rest] = b[from];
        return { ...b, [from]: rest, [to]: [...b[to], lead] };
      });
    }, 3200);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <div ref={ref} className={cn("grid grid-cols-3 gap-2", className)}>
      {columns.map((col) => (
        <div key={col} className="rounded-xl border border-border bg-surface p-2">
          <p className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            {col} <span className="rounded-full bg-background px-1.5 text-[9px]">{board[col].length}</span>
          </p>
          <div className={cn("mt-2 flex flex-col gap-1.5", compact ? "min-h-20" : "min-h-28")}>
            {board[col].map((lead) => (
              <m.div key={lead.id} layoutId={lead.id} layout transition={{ type: "spring", stiffness: 260, damping: 26 }} className="rounded-lg border border-border bg-background p-2 text-[10px] shadow-soft">
                <p className="font-semibold text-text">{lead.name}</p>
                <p className="mt-0.5 flex justify-between text-text-muted"><span>{lead.source}</span><span className="font-medium text-primary">{lead.value}</span></p>
              </m.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

`components/mockups/ItrMock.tsx`:
```tsx
"use client";

import { m } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring, viewport } from "@/lib/motion";

const fields = [
  ["PAN", "ABCPK1234F"],
  ["Employer", "Meridian Foods Pvt Ltd"],
  ["Gross salary (Form 16)", "₹14,20,000"],
  ["80C deductions", "₹1,50,000"],
  ["TDS deducted", "₹1,02,400"],
  ["Refund due", "₹6,800"],
];

export function ItrMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("relative rounded-xl border border-border p-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text">ITR-1 · AY 2026–27</p>
        <m.span initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={viewport} transition={{ ...spring, delay: 0.9 }} className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          Filed in 4 min
        </m.span>
      </div>
      <ul className="mt-2 divide-y divide-border/60 text-[11px]">
        {fields.slice(0, compact ? 4 : 6).map(([k, v], i) => (
          <li key={k} className="flex items-center justify-between py-1.5">
            <span className="text-text-muted">{k}</span>
            <span className="flex items-center gap-1.5 font-medium text-text">
              {v}
              <m.span initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={viewport} transition={{ ...spring, delay: 0.15 + i * 0.12 }} className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                <Check aria-hidden="true" className="size-2.5" strokeWidth={3} />
              </m.span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-text-muted">Pre-filled from payroll and Form 16. Review, e-verify with Aadhaar OTP, done.</p>
    </div>
  );
}
```

- [ ] **Step 5: Implement the barrel with `MockupFor`**

`components/mockups/index.tsx` (`.tsx` because it contains JSX):
```tsx
import type { MockupKind } from "@/content/modules";
import { DashboardMock } from "./DashboardMock";
import { AccountingMock } from "./AccountingMock";
import { InventoryMock } from "./InventoryMock";
import { PosMock } from "./PosMock";
import { CrmMock } from "./CrmMock";
import { ItrMock } from "./ItrMock";

export { BrowserFrame } from "./BrowserFrame";
export { PhoneFrame } from "./PhoneFrame";
export { Toasts } from "./Toasts";
export { DashboardMock, AccountingMock, InventoryMock, PosMock, CrmMock, ItrMock };

const map = {
  dashboard: DashboardMock,
  accounting: AccountingMock,
  inventory: InventoryMock,
  pos: PosMock,
  crm: CrmMock,
  itr: ItrMock,
} as const;

export function MockupFor({ kind, compact, className }: { kind: MockupKind; compact?: boolean; className?: string }) {
  if (kind === "none") return null;
  const Comp = map[kind];
  return <Comp compact={compact} className={className} />;
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run tests/components/mockups` → all pass. `npm run typecheck`, `npm run lint` → clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(mockups): add browser/phone frames and six self-animating module mockups with Indian sample data" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 10: Home sections, part 1 — Hero, TrustBar, ValueProp, ModuleShowcase, ModuleGrid

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/TrustBar.tsx`, `components/sections/ValueProp.tsx`, `components/sections/ModuleShowcase.tsx`, `components/sections/ModuleGrid.tsx`, `tests/components/sections/Hero.test.tsx`, `tests/components/sections/ModuleShowcase.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–9 (tokens, brand, content, ui, motion, mockups).
- Produces: `<Hero />`, `<TrustBar />`, `<ValueProp />`, `<ModuleShowcase />`, `<ModuleGrid />` — all self-contained sections that take no props.

- [ ] **Step 1: Write failing tests**

`tests/components/sections/Hero.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";

test("hero has the h1, both CTAs and the dashboard mockup", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /start free/i })).toHaveAttribute("href", "/register/");
  expect(screen.getByRole("link", { name: /book a demo/i })).toHaveAttribute("href", "/contact/");
  expect(screen.getByText(/cash in bank/i)).toBeInTheDocument();
});
```

`tests/components/sections/ModuleShowcase.test.tsx`:
```tsx
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("motion/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("motion/react")>();
  return { ...mod, useReducedMotion: () => true, useInView: () => true };
});

import { ModuleShowcase } from "@/components/sections/ModuleShowcase";

afterEach(() => vi.useRealTimers());

test("renders five tabs and switches panels on click", async () => {
  const user = userEvent.setup();
  render(<ModuleShowcase />);
  expect(screen.getAllByRole("tab")).toHaveLength(5);
  expect(screen.getByRole("tabpanel")).toHaveTextContent(/cash in bank/i);
  await user.click(screen.getByRole("tab", { name: /crm/i }));
  expect(screen.getByRole("tabpanel")).toHaveTextContent(/qualified/i);
});

test("does not auto-advance under reduced motion", () => {
  vi.useFakeTimers();
  render(<ModuleShowcase />);
  act(() => {
    vi.advanceTimersByTime(7000);
  });
  expect(screen.getByRole("tab", { name: /dashboard/i })).toHaveAttribute("aria-selected", "true");
});
```

Run: `npx vitest run tests/components/sections`
Expected: FAIL — modules not found.

- [ ] **Step 2: Implement Hero**

`components/sections/Hero.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { CircleCheck, IndianRupee, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { SplitWords } from "@/components/motion/SplitWords";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { AuroraBackground } from "@/components/motion/AuroraBackground";
import { CursorSpotlight } from "@/components/motion/CursorSpotlight";
import { BrowserFrame, DashboardMock } from "@/components/mockups";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const chips = [
  { icon: CircleCheck, text: "GSTR-3B filed", className: "-left-6 top-10 lg:-left-12", z: 60, delay: 1.1, duration: 5 },
  { icon: IndianRupee, text: "₹4.2L collected today", className: "-right-4 top-1/3 lg:-right-10", z: 90, delay: 1.3, duration: 6 },
  { icon: Users, text: "12 new leads", className: "-left-2 bottom-8 lg:-left-8", z: 40, delay: 1.5, duration: 7 },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-20">
      <AuroraBackground />
      <CursorSpotlight />
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <AnimatedLogo size={72} />
            <m.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease }} data-reveal className="mt-6">
              <Badge tone="primary">
                <Sparkles aria-hidden="true" className="size-3.5" /> The business OS for India
              </Badge>
            </m.div>
            <SplitWords
              as="h1"
              text="Everything your business runs on. One OS."
              highlightLast={2}
              delay={0.6}
              className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl xl:text-7xl"
            />
            <m.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6, ease }} data-reveal className="mt-6 max-w-xl text-lg text-text-muted sm:text-xl">
              HR, payroll, accounting, CRM, inventory, projects and GST filing on one platform. Enter a fact once — a sale, a salary, a stock receipt — and every department, report and return follows.
            </m.p>
            <m.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: 0.6, ease }} data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton>
                <Button href="/register/" size="lg" arrow>Start free</Button>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <Button href="/contact/" size="lg" variant="outline">Book a demo</Button>
              </MagneticButton>
            </m.div>
            <m.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} data-reveal className="mt-5 text-sm text-text-muted">
              Free for up to 5 users · No card needed · GST-ready in a day
            </m.p>
          </div>

          <m.div
            initial={reduce ? false : { opacity: 0, y: 48, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease }}
            data-reveal
            className="relative mx-auto w-full max-w-xl perspective lg:max-w-none"
          >
            <TiltCard max={7} className="relative">
              <BrowserFrame url="app.allyouneed.in/dashboard">
                <DashboardMock />
              </BrowserFrame>
              {chips.map((c, i) => (
                <m.div
                  key={c.text}
                  aria-hidden="true"
                  className={cn("absolute hidden items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-text shadow-lift backdrop-blur sm:flex", c.className)}
                  style={{ z: c.z }}
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
                  transition={reduce ? undefined : { opacity: { delay: c.delay, duration: 0.4 }, scale: { delay: c.delay, duration: 0.4 }, y: { delay: c.delay + i * 0.3, duration: c.duration, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <c.icon aria-hidden="true" className="size-4 text-primary" />
                  {c.text}
                </m.div>
              ))}
            </TiltCard>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Implement TrustBar and ValueProp**

`components/sections/TrustBar.tsx`:
```tsx
import { Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/motion/Marquee";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { stats, trustLogos } from "@/content/stats";

export function TrustBar() {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-border bg-surface/60 py-14">
      <Container>
        <Reveal variant="fadeIn">
          <p id="trust-heading" className="text-center text-sm font-medium text-text-muted">
            Trusted by 200+ growing Indian businesses · 15+ modules, one login
          </p>
        </Reveal>
        <Marquee className="mt-8" speed={45}>
          {trustLogos.map((name) => (
            <span key={name} className="flex items-center gap-2 whitespace-nowrap font-display text-lg font-bold text-text-muted/70 transition-colors hover:text-text">
              <Building2 aria-hidden="true" className="size-5" />
              {name}
            </span>
          ))}
        </Marquee>
        <Stagger className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-1 text-sm text-text-muted">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
```

`components/sections/ValueProp.tsx` — an orbit diagram: module icons around the logo mark, connector lines draw in on view:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { Database, RefreshCw, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { LogoMark } from "@/components/brand/LogoMark";
import { modules } from "@/content/modules";
import { ease, viewport } from "@/lib/motion";

const points = [
  { icon: Database, title: "One database", body: "Sales, payroll, stock and books share the same records. Nothing is exported, imported or re-keyed." },
  { icon: RefreshCw, title: "Instant sync", body: "Approve a salary and the ledger, the TDS register and the cash-flow forecast update together." },
  { icon: ShieldCheck, title: "Always audit-ready", body: "Every change is logged with who, when and why — the trail your auditor and the Companies Act expect." },
];

const ring = modules.slice(0, 8);
const R = 150;

export function ValueProp() {
  const reduce = useReducedMotion();
  return (
    <Section>
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Not just an ERP" title={<>Your whole business. <span className="text-gradient">In one OS.</span></>} lead="Most tools bolt departments together with exports and integrations. Allyouneed starts from a single source of truth, so duplicate entry simply doesn't exist." />
            </Reveal>
            <ul className="mt-10 space-y-6">
              {points.map((p, i) => (
                <Reveal key={p.title} as="li" delay={i * 0.1}>
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <p.icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text">{p.title}</h3>
                      <p className="mt-1 text-text-muted">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal variant="scaleIn" className="relative mx-auto aspect-square w-full max-w-md">
            <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle r={R} fill="none" stroke="var(--border)" strokeDasharray="4 8" />
              {ring.map((_, i) => {
                const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <m.line
                    key={i}
                    x1={0}
                    y1={0}
                    x2={Math.cos(a) * R}
                    y2={Math.sin(a) * R}
                    stroke="var(--primary)"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={viewport}
                    transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.08 }}
                  />
                );
              })}
            </svg>
            <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-border bg-background shadow-lift">
              <LogoMark size={48} title="" />
              {!reduce ? <span className="absolute inset-0 -z-10 animate-ping rounded-3xl bg-primary/20 [animation-duration:3s]" /> : null}
            </div>
            {ring.map((mod, i) => {
              const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + (Math.cos(a) * R) / 4;
              const y = 50 + (Math.sin(a) * R) / 4;
              return (
                <m.div
                  key={mod.slug}
                  className="absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-border bg-background text-primary shadow-soft"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={mod.name}
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.5 + i * 0.08 }}
                >
                  <mod.icon aria-hidden="true" className="size-5" />
                  <span className="sr-only">{mod.name}</span>
                </m.div>
              );
            })}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Implement ModuleShowcase (layoutId pill, crossfade, autoplay with progress bar)**

`components/sections/ModuleShowcase.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { BrowserFrame, MockupFor } from "@/components/mockups";
import type { MockupKind } from "@/content/modules";
import { ease, spring } from "@/lib/motion";

const AUTOPLAY_MS = 6000;

const showcase: { id: string; label: string; kind: MockupKind; title: string; points: string[]; href: string }[] = [
  { id: "dashboard", label: "Dashboard", kind: "dashboard", title: "See the whole company at 9 am", points: ["Cash, receivables, payroll and pipeline on one screen", "Drill from any KPI to the voucher behind it", "Filing calendar with live status"], href: "/features/#reports" },
  { id: "accounting", label: "Accounting", kind: "accounting", title: "Books that balance themselves", points: ["Every module posts to the ledger automatically", "Bank reconciliation with rule-based matching", "GST-ready P&L, balance sheet and cash flow"], href: "/features/#accounting" },
  { id: "inventory", label: "Inventory", kind: "inventory", title: "Stock across every location", points: ["Batch, serial and expiry tracking", "Reorder alerts before you run out", "Valuation and HSN summaries for GST"], href: "/features/#inventory" },
  { id: "pos", label: "POS Billing", kind: "pos", title: "Bill fast, file automatically", points: ["Touch-friendly counter with barcode scanning", "UPI, card and cash with split payments", "Every bill lands in accounting and GSTR-1"], href: "/features/#inventory" },
  { id: "crm", label: "CRM & Leads", kind: "crm", title: "Every lead, owned and followed up", points: ["Leads from WhatsApp, Instagram and your website", "Kanban pipeline with rotting alerts", "Quotes that convert to invoices"], href: "/features/#crm" },
];

export function ModuleShowcase() {
  const [active, setActive] = useState(showcase[0].id);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const autoplay = !paused && !reduce && inView;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => {
      setActive((cur) => showcase[(showcase.findIndex((s) => s.id === cur) + 1) % showcase.length].id);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, autoplay]);

  const current = showcase.find((s) => s.id === active)!;

  return (
    <Section id="showcase" tone="surface">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="One login" title="Every department, one screen away" lead="Switch between modules the way your team does during a day. The data underneath never changes hands." />
        </Reveal>
        <div ref={ref} className="mt-12" onMouseEnter={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
          <div className="mx-auto w-fit max-w-full overflow-x-auto">
            <Tabs
              tabs={showcase.map((s) => ({ id: s.id, label: s.label }))}
              value={active}
              onChange={(id) => {
                setPaused(true);
                setActive(id);
              }}
              ariaLabel="Modules"
              indicator={
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <m.span layoutId="showcase-pill" className="absolute inset-0 rounded-full bg-primary" transition={spring} />
                  {autoplay ? <m.span key={active} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white/70" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} /> : null}
                </span>
              }
            />
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
            <AnimatePresence mode="wait">
              <m.div key={current.id + "-copy"} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
                <h3 className="font-display text-2xl font-bold text-text sm:text-3xl">{current.title}</h3>
                <ul className="mt-6 space-y-3">
                  {current.points.map((p) => (
                    <li key={p} className="flex gap-3 text-text-muted">
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Button href={current.href} variant="ghost" arrow className="mt-6 -ml-4">Explore {current.label}</Button>
              </m.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                role="tabpanel"
                id={`${current.id}-panel`}
                aria-labelledby={`${current.id}-tab`}
                initial={reduce ? false : { opacity: 0, x: 32, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -32, scale: 0.98 }}
                transition={{ duration: 0.45, ease }}
              >
                <BrowserFrame url={`app.allyouneed.in/${current.id}`}>
                  <MockupFor kind={current.kind} />
                </BrowserFrame>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Implement ModuleGrid**

`components/sections/ModuleGrid.tsx`:
```tsx
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { modules } from "@/content/modules";

export function ModuleGrid() {
  return (
    <Section id="modules">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="12 core modules" title="Everything a growing company needs" lead="Start with the two you need today. Turn on the rest when you're ready — the data is already there." />
        </Reveal>
        <Stagger gap={0.06} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <StaggerItem key={mod.slug} className="h-full">
              <SpotlightCard as="a" href={`/features/#${mod.slug}`} className="block h-full">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110">
                    <mod.icon aria-hidden="true" className="size-6" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-5 text-text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-text">{mod.name}</h3>
                <p className="mt-2 text-sm text-text-muted">{mod.short}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run tests/components/sections` → all pass. `npm run typecheck`, `npm run lint` → clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add hero with 3D dashboard and floating chips, trust marquee with counters, orbit value prop, auto-advancing module showcase, spotlight module grid" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Home sections, part 2 — Integrations, MobileApp, AiWorkflow, TaxTeaser, JourneyTimeline, EmployeeItr, ExpertHelp, Testimonials, FinalCta; assemble the home page

**Files:**
- Create: `components/sections/Integrations.tsx`, `components/sections/MobileApp.tsx`, `components/sections/AiWorkflow.tsx`, `components/sections/TaxTeaser.tsx`, `components/sections/JourneyTimeline.tsx`, `components/sections/EmployeeItr.tsx`, `components/sections/ExpertHelp.tsx`, `components/sections/Testimonials.tsx`, `components/sections/FinalCta.tsx`, `tests/pages/home.test.tsx`
- Modify: `app/page.tsx`, `tests/smoke.test.tsx` (delete — superseded by `tests/pages/home.test.tsx`)

**Interfaces:**
- Produces: nine prop-less sections; `JourneyTimeline`, `ExpertHelp`, `FinalCta` are reused by other pages (Tasks 13, 16). `FinalCta` accepts optional `{ title?: string; body?: string }`.

- [ ] **Step 1: Write the failing home page test**

`tests/pages/home.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("home page renders every section landmark in order", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
  const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent ?? "");
  const expectedOrder = [
    /whole business/i,
    /every department, one screen away/i,
    /everything a growing company needs/i,
    /connected to how you work/i,
    /run the business from your phone/i,
    /record once/i,
    /every tax\. one place to file it/i,
    /incorporation to year end/i,
    /files their return in minutes/i,
    /a professional, when you need one/i,
    /teams that switched/i,
    /run your whole business on allyouneed/i,
  ];
  let cursor = 0;
  for (const re of expectedOrder) {
    const idx = h2s.findIndex((t, i) => i >= cursor && re.test(t));
    expect(idx, `missing or out of order: ${re}`).toBeGreaterThanOrEqual(cursor);
    cursor = idx + 1;
  }
});
```

Run: `npx vitest run tests/pages`
Expected: FAIL — headings missing.

- [ ] **Step 2: Implement Integrations and MobileApp**

`components/sections/Integrations.tsx`:
```tsx
import { Bot, Lock } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { integrations } from "@/content/integrations";

export function Integrations() {
  return (
    <Section tone="surface" id="integrations">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Integrations" title="Connected to how you work" lead="Payments, messaging, ads, listings and telephony plug straight into the right module. No middleware, no CSVs." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((it) => (
            <StaggerItem key={it.name}>
              <Card hover className="group h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-500 group-hover:rotate-[8deg]">
                  <it.icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{it.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{it.blurb}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card className="relative h-full overflow-hidden bg-gradient-to-br from-primary to-[#7F77DD] text-white">
              <span className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <Bot aria-hidden="true" className="size-7" />
              <h3 className="mt-4 font-display text-xl font-bold">AI across every module</h3>
              <p className="mt-2 text-white/85">Duplicate vendors, mismatched input tax credit, a payslip that jumped 40%, a lead that went quiet — flagged before they cost you, with a one-line explanation.</p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full">
              <Lock aria-hidden="true" className="size-7 text-primary" />
              <h3 className="mt-4 font-display text-xl font-bold text-text">Enterprise-grade security</h3>
              <p className="mt-2 text-text-muted">Encryption in transit and at rest, role-based access per branch and module, full audit logs and Indian data residency. Designed to align with the DPDP Act 2023, ISO 27001 and SOC 2.</p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
```

`components/sections/MobileApp.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Check, Smartphone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneFrame, DashboardMock, PosMock } from "@/components/mockups";

const bullets = ["Approve leave, expenses and payroll on the go", "Geo-fenced attendance for field teams", "Bill customers and share UPI links from the counter", "Follow up leads with WhatsApp in one tap", "Founder dashboard in light or dark mode"];

export function MobileApp() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-30, 90]);
  const r1 = useTransform(scrollYProgress, [0, 1], [-4, 3]);
  const r2 = useTransform(scrollYProgress, [0, 1], [5, -4]);

  return (
    <Section id="mobile">
      <Container>
        <div ref={ref} className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Mobile app" title="Run the business from your phone" lead="The same modules, the same data, sized for a screen you already carry. Light or dark — your choice." />
            </Reveal>
            <ul className="mt-8 space-y-3">
              {bullets.map((b, i) => (
                <Reveal key={b} as="li" delay={i * 0.06}>
                  <div className="flex gap-3 text-text-muted">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                    {b}
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
              <Badge tone="neutral" className="px-4 py-2 text-sm"><Smartphone aria-hidden="true" className="size-4" /> Android · Coming soon</Badge>
              <Badge tone="neutral" className="px-4 py-2 text-sm"><Smartphone aria-hidden="true" className="size-4" /> iOS · Coming soon</Badge>
            </Reveal>
          </div>
          <div className="relative mx-auto flex h-[560px] w-full max-w-md items-center justify-center">
            <m.div style={reduce ? undefined : { y: y1, rotate: r1 }} className="absolute left-0 top-6 z-10">
              <PhoneFrame tone="light">
                <p className="text-xs font-semibold">Good morning, Rhea</p>
                <div className="mt-3"><DashboardMock compact /></div>
              </PhoneFrame>
            </m.div>
            <m.div style={reduce ? undefined : { y: y2, rotate: r2 }} className="absolute right-0 top-24 z-20">
              <PhoneFrame tone="dark">
                <p className="text-xs font-semibold">Counter 2</p>
                <div className="mt-3"><PosMock compact /></div>
              </PhoneFrame>
            </m.div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Implement AiWorkflow (scroll-drawn connector) and TaxTeaser**

`components/sections/AiWorkflow.tsx`:
```tsx
"use client";

import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useSpring, useReducedMotion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { workflowSteps } from "@/content/workflow";
import { cn } from "@/lib/cn";

export function AiWorkflow() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(reduce ? workflowSteps.length : 0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(workflowSteps.length, Math.floor(v * workflowSteps.length + 0.35)));
  });

  const lineStyle = reduce ? undefined : { scaleX: progress, scaleY: progress };

  return (
    <Section tone="surface" id="workflow">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Record once. Everything else follows." lead="Four things happen every time someone in your company does their job. You only do the first one." />
        </Reveal>
        <ol ref={ref} className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden="true" className="absolute left-6 top-0 h-full w-px bg-border lg:left-0 lg:top-6 lg:h-px lg:w-full" />
          <m.div aria-hidden="true" style={lineStyle} className="absolute left-6 top-0 h-full w-px origin-top bg-gradient-to-b from-primary to-accent lg:left-0 lg:top-6 lg:h-px lg:w-full lg:origin-left lg:bg-gradient-to-r" />
          {workflowSteps.map((s, i) => {
            const on = reduce || i < active;
            return (
              <li key={s.title} className="relative pl-16 lg:pl-0 lg:pt-16">
                <m.span
                  animate={{ scale: on ? 1 : 0.85 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn("absolute left-0 top-0 grid size-12 place-items-center rounded-full border-2 transition-colors duration-500 lg:left-0 lg:top-0", on ? "border-primary bg-primary text-white shadow-lift" : "border-border bg-background text-text-muted")}
                >
                  <s.icon aria-hidden="true" className="size-5" />
                </m.span>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step {i + 1}</p>
                <h3 className={cn("mt-1 font-display text-xl font-bold transition-colors duration-500", on ? "text-text" : "text-text-muted")}>{s.title}</h3>
                <p className="mt-2 text-text-muted">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
```

`components/sections/TaxTeaser.tsx`:
```tsx
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { taxCategories } from "@/content/tax";

export function TaxTeaser() {
  return (
    <Section id="tax">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Tax & compliance" title="Every tax. One place to file it." lead="GST, TDS, income tax, PF and ESI, ROC — prepared from your live books, reviewed by you, filed on the calendar." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taxCategories.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <SpotlightCard as="a" href={`/tax-compliance/#${c.slug}`} className="block h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-[#854F0B] dark:text-accent"><c.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{c.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{c.tagline}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {c.filings.slice(0, 3).map((f) => (
                    <li key={f} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">{f.split(" (")[0]}</li>
                  ))}
                </ul>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Button href="/tax-compliance/" variant="outline" arrow>See every filing we cover</Button>
        </Reveal>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Implement JourneyTimeline, EmployeeItr, ExpertHelp**

`components/sections/JourneyTimeline.tsx`:
```tsx
"use client";

import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useSpring, useReducedMotion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { journey } from "@/content/journey";
import { cn } from "@/lib/cn";

export function JourneyTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(reduce ? journey.length : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(journey.length, Math.floor(v * journey.length + 0.5))));

  return (
    <Section tone="surface" id="journey">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="From incorporation to year end" title="Incorporation to year end, on one timeline" lead="Whether you're registering a new company or moving an established one, the same platform carries you through every stage." />
        </Reveal>
        <ol ref={ref} className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden="true" className="absolute left-[11px] top-0 h-full w-0.5 bg-border lg:left-0 lg:top-[11px] lg:h-0.5 lg:w-full" />
          <m.div aria-hidden="true" style={reduce ? undefined : { scaleX: progress, scaleY: progress }} className="absolute left-[11px] top-0 h-full w-0.5 origin-top bg-primary lg:left-0 lg:top-[11px] lg:h-0.5 lg:w-full lg:origin-left" />
          {journey.map((mstone, i) => {
            const on = reduce || i < active;
            return (
              <li key={mstone.title} className="relative pl-10 lg:pl-0 lg:pt-10">
                <m.span
                  aria-hidden="true"
                  animate={on && !reduce ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className={cn("absolute left-0 top-0 size-6 rounded-full border-4 border-background transition-colors duration-500", on ? "bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_25%,transparent)]" : "bg-border")}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{mstone.when}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-text">{mstone.title}</h3>
                <p className="mt-2 text-text-muted">{mstone.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
```

`components/sections/EmployeeItr.tsx`:
```tsx
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { ItrMock } from "@/components/mockups";

const bullets = ["Form 16 data pre-filled from payroll", "Deductions suggested from declarations already on file", "E-verify with Aadhaar OTP, no portal juggling", "Refund tracking on the employee's dashboard"];

export function EmployeeItr() {
  return (
    <Section id="employee-itr">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal variant="scaleIn" className="order-2 lg:order-1">
            <TiltCard max={5}>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-lift sm:p-6">
                <ItrMock />
              </div>
            </TiltCard>
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="For every employee" title="Every employee files their return in minutes" lead="Because payroll already knows the numbers, an ITR-1 takes four minutes, not a weekend. A perk for your team, zero work for HR." />
            </Reveal>
            <ul className="mt-8 space-y-3">
              {bullets.map((b, i) => (
                <Reveal key={b} as="li" delay={i * 0.06}>
                  <div className="flex gap-3 text-text-muted">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                    {b}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

`components/sections/ExpertHelp.tsx`:
```tsx
import { BadgeCheck, FileText, Scale, Users } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const services = [
  { icon: Scale, title: "Statutory, tax and internal audits", body: "Audit-ready books, handed to an auditor from our network or yours." },
  { icon: FileText, title: "Tax notice support", body: "A GST or income-tax notice lands? A professional drafts the reply from your records." },
  { icon: BadgeCheck, title: "Advisory", body: "Structuring, incentives, transfer pricing and the questions that don't fit a help article." },
  { icon: Users, title: "200+ chartered accountants", body: "Vetted, rated and priced upfront. Engage for one filing or the whole year." }, // PLACEHOLDER count
];

export function ExpertHelp() {
  return (
    <Section tone="surface" id="experts">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Expert help" title="A professional, when you need one" lead="Software does the routine. For everything else, a chartered accountant is a click away — inside the same platform, working on the same data." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem key={s.title} className="h-full">
              <Card hover className="group h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-500 group-hover:scale-110"><s.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Button href="/contact/" variant="outline" arrow>Talk to an expert</Button>
        </Reveal>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Implement Testimonials and FinalCta**

`components/sections/Testimonials.tsx`:
```tsx
import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  return (
    <Section id="testimonials">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Customers" title="Teams that switched, in their words" />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <Card hover as="article" className="flex h-full flex-col">
                <Quote aria-hidden="true" className="size-8 text-primary/40" />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-text">“{t.quote}”</blockquote>
                <footer className="mt-6 flex items-center gap-3">
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">{t.initials}</span>
                  <div>
                    <p className="font-semibold text-text">{t.name}</p>
                    <p className="text-sm text-text-muted">{t.role}, {t.company}</p>
                  </div>
                </footer>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
```

`components/sections/FinalCta.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";

type Props = { title?: string; body?: string };

export function FinalCta({ title = "Run your whole business on Allyouneed.", body = "Free for up to five users. Import from Tally or Excel in an afternoon. Cancel any time." }: Props) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal variant="scaleIn">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#6A61CF] to-[#7F77DD] px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div aria-hidden="true" className="absolute -left-20 -top-20 size-72 rounded-full bg-accent/30 blur-3xl animate-aurora" />
            <div aria-hidden="true" className="absolute -bottom-24 -right-16 size-72 rounded-full bg-white/20 blur-3xl animate-aurora [animation-delay:-8s]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{body}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MagneticButton>
                  <Button href="/register/" size="lg" variant="secondary" arrow className="bg-white text-primary hover:bg-white dark:bg-white dark:text-primary">Start free</Button>
                </MagneticButton>
                <MagneticButton strength={0.15}>
                  <Button href="/contact/" size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:border-white hover:text-white">Book a demo</Button>
                </MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
```

- [ ] **Step 6: Assemble `app/page.tsx` and remove the smoke test**

`app/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProp } from "@/components/sections/ValueProp";
import { ModuleShowcase } from "@/components/sections/ModuleShowcase";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { Integrations } from "@/components/sections/Integrations";
import { MobileApp } from "@/components/sections/MobileApp";
import { AiWorkflow } from "@/components/sections/AiWorkflow";
import { TaxTeaser } from "@/components/sections/TaxTeaser";
import { JourneyTimeline } from "@/components/sections/JourneyTimeline";
import { EmployeeItr } from "@/components/sections/EmployeeItr";
import { ExpertHelp } from "@/components/sections/ExpertHelp";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: { absolute: "Allyouneed — Everything your business runs on. One OS." },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueProp />
      <ModuleShowcase />
      <ModuleGrid />
      <Integrations />
      <MobileApp />
      <AiWorkflow />
      <TaxTeaser />
      <JourneyTimeline />
      <EmployeeItr />
      <ExpertHelp />
      <Testimonials />
      <FinalCta />
    </>
  );
}
```

Delete `tests/smoke.test.tsx`.

- [ ] **Step 7: Run tests, typecheck, lint, build**

Run: `npm test` → all pass (the home test verifies section order). `npm run typecheck`, `npm run lint` → clean. `npx next build` → compiles with `○ /`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(home): add integrations, phone parallax, scroll-drawn workflow, tax teaser, journey timeline, employee ITR, expert help, testimonials, final CTA; assemble home page" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 12: Features page

**Files:**
- Create: `components/sections/FeatureDetail.tsx`, `components/sections/FeatureSideNav.tsx`, `lib/useActiveSection.ts`, `app/features/page.tsx`, `tests/pages/features.test.tsx`

**Interfaces:**
- Consumes: `modules`, `Module` (Task 4), `MockupFor` (Task 9), `Reveal`, `TiltCard`, `Section`, `Container`, `SectionHeading`, `FinalCta`.
- Produces: `<FeatureDetail module index />`, `<FeatureSideNav items: {id; label}[] />`, `useActiveSection(ids: string[]): string | null`, route `/features/`.

- [ ] **Step 1: Write the failing page test**

`tests/pages/features.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeaturesPage from "@/app/features/page";
import { modules } from "@/content/modules";

test("features page lists every module with an anchor and side nav", () => {
  render(<FeaturesPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/every module/i);
  for (const mod of modules) {
    const heading = screen.getByRole("heading", { level: 2, name: mod.name });
    expect(heading.closest("section")).toHaveAttribute("id", mod.slug);
  }
  const nav = screen.getByRole("navigation", { name: /on this page/i });
  expect(nav.querySelectorAll("a")).toHaveLength(modules.length);
});
```

Run: `npx vitest run tests/pages/features.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement the active-section hook and side nav**

`lib/useActiveSection.ts`:
```ts
"use client";

import { useEffect, useState } from "react";

/** Returns the id of the section currently nearest the top third of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}
```

`components/sections/FeatureSideNav.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import { m } from "motion/react";
import { useActiveSection } from "@/lib/useActiveSection";
import { cn } from "@/lib/cn";

export function FeatureSideNav({ items }: { items: { id: string; label: string }[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);

  return (
    <nav aria-label="On this page" className="sticky top-28 hidden self-start lg:block">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Modules</p>
      <ul className="mt-3 space-y-0.5 border-l border-border">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id} className="relative">
              {on ? <m.span layoutId="feature-nav-active" className="absolute -left-px top-0 h-full w-0.5 bg-primary" transition={{ type: "spring", stiffness: 400, damping: 30 }} /> : null}
              <a href={`#${it.id}`} aria-current={on ? "location" : undefined} className={cn("block px-4 py-1.5 text-sm transition-colors", on ? "font-semibold text-primary" : "text-text-muted hover:text-text")}>
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Implement FeatureDetail**

`components/sections/FeatureDetail.tsx`:
```tsx
import { Check } from "lucide-react";
import type { Module } from "@/content/modules";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { MockupFor } from "@/components/mockups";
import { cn } from "@/lib/cn";

export function FeatureDetail({ module: mod, index }: { module: Module; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section id={mod.slug} aria-labelledby={`${mod.slug}-title`} className="scroll-mt-28 py-12 first:pt-0 lg:py-16">
      <div className={cn("grid items-center gap-10 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
        <div>
          <Reveal>
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <mod.icon aria-hidden="true" className="size-6" />
            </span>
            <h2 id={`${mod.slug}-title`} className="mt-5 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">{mod.name}</h2>
            <p className="mt-3 text-lg text-text-muted">{mod.description}</p>
          </Reveal>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {mod.bullets.map((b, i) => (
              <Reveal key={b} as="li" delay={0.05 * i}>
                <div className="flex gap-2.5 text-sm text-text">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                  {b}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal variant="scaleIn">
          <TiltCard max={5}>
            <div className="rounded-2xl border border-border bg-background p-4 shadow-lift">
              {mod.mockup === "none" ? (
                <div className="grid min-h-56 place-items-center rounded-xl bg-surface p-6">
                  <div className="text-center">
                    <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-[#7F77DD] text-white shadow-lift"><mod.icon aria-hidden="true" className="size-9" /></span>
                    <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                      {mod.bullets.slice(0, 4).map((b) => (
                        <span key={b} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-text-muted">{b.split(" ").slice(0, 3).join(" ")}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MockupFor kind={mod.mockup} compact />
              )}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement the page**

`app/features/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FeatureDetail } from "@/components/sections/FeatureDetail";
import { FeatureSideNav } from "@/components/sections/FeatureSideNav";
import { FinalCta } from "@/components/sections/FinalCta";
import { modules } from "@/content/modules";

export const metadata: Metadata = {
  title: "Features",
  description: "Twelve modules — HR, payroll, accounting, CRM, inventory and POS, attendance, tax filing, projects, assets, reports, communications and integrations — on one database.",
};

export default function FeaturesPage() {
  return (
    <>
      <Container className="pb-8 pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Features" title="Every module, one database" lead="Turn on what you need today. Everything you add later already knows your customers, employees, stock and books." />
        </Reveal>
      </Container>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <FeatureSideNav items={modules.map((mod) => ({ id: mod.slug, label: mod.name }))} />
          <div className="divide-y divide-border">
            {modules.map((mod, i) => (
              <FeatureDetail key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </div>
      </Container>
      <FinalCta title="Turn on your first module today." body="Free for up to five users. Add modules as you grow — the data is already connected." />
    </>
  );
}
```

- [ ] **Step 5: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/pages/features.test.tsx` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(features): add features page with sticky side nav and per-module detail sections" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Tax & Compliance page

**Files:**
- Create: `components/sections/TaxCategories.tsx`, `components/sections/ComplianceCalendar.tsx`, `app/tax-compliance/page.tsx`, `tests/pages/tax.test.tsx`

**Interfaces:**
- Consumes: `taxCategories`, `complianceCalendar` (Task 4); `JourneyTimeline`, `ExpertHelp`, `FinalCta` (Task 11); ui + motion primitives.
- Produces: `<TaxCategories />`, `<ComplianceCalendar />`, route `/tax-compliance/`.

- [ ] **Step 1: Write the failing page test**

`tests/pages/tax.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaxPage from "@/app/tax-compliance/page";
import { taxCategories } from "@/content/tax";

test("tax page renders categories with anchors, the calendar, journey and experts", () => {
  render(<TaxPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/every tax/i);
  for (const c of taxCategories) {
    expect(screen.getByRole("heading", { level: 3, name: c.name }).closest("article")).toHaveAttribute("id", c.slug);
  }
  expect(screen.getByRole("heading", { level: 2, name: /a typical month/i })).toBeInTheDocument();
  expect(screen.getAllByText(/GSTR-3B/).length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { level: 2, name: /incorporation to year end/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: /a professional/i })).toBeInTheDocument();
});
```

Run: `npx vitest run tests/pages/tax.test.tsx` → FAIL.

- [ ] **Step 2: Implement TaxCategories**

`components/sections/TaxCategories.tsx`:
```tsx
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { taxCategories } from "@/content/tax";

export function TaxCategories() {
  return (
    <Section className="pt-8 sm:pt-12">
      <Container>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {taxCategories.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <SpotlightCard as="article" id={c.slug} className="h-full scroll-mt-28">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-[#854F0B] dark:text-accent"><c.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-xl font-bold text-text">{c.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{c.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {c.filings.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-text">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
```

The `id` sits on the `<article>` itself (via `SpotlightCard`'s `id` prop from Task 7) so the test and the `/tax-compliance/#gst` anchor links both resolve to the card.

- [ ] **Step 3: Implement ComplianceCalendar**

`components/sections/ComplianceCalendar.tsx`:
```tsx
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { complianceCalendar } from "@/content/tax";
import { cn } from "@/lib/cn";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export function ComplianceCalendar() {
  const dueDays = new Set(complianceCalendar.map((c) => c.day));
  return (
    <Section tone="surface" id="calendar">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Compliance calendar" title="A typical month, already scheduled" lead="Every due date is on your dashboard with the return pre-prepared. Reminders go to the right person on WhatsApp and email." />
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal variant="scaleIn">
            <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
              <p className="font-display text-sm font-bold text-text">This month</p>
              <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="py-1 font-semibold text-text-muted">{d}</span>
                ))}
                {days.map((d) => {
                  const due = dueDays.has(d);
                  return (
                    <span
                      key={d}
                      title={due ? complianceCalendar.filter((c) => c.day === d).map((c) => c.title).join(" · ") : undefined}
                      className={cn("grid aspect-square place-items-center rounded-lg transition-transform duration-300 hover:scale-110", due ? "bg-primary font-bold text-white shadow-soft" : "bg-surface text-text-muted")}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <Stagger className="space-y-2.5">
            {complianceCalendar.map((c) => (
              <StaggerItem key={`${c.day}-${c.title}`}>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary/40">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-lg font-bold text-primary">{c.day}</span>
                  <p className="flex-1 text-sm font-medium text-text">{c.title}</p>
                  <Badge tone="neutral">{c.category}</Badge>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Implement the page**

`app/tax-compliance/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TaxCategories } from "@/components/sections/TaxCategories";
import { ComplianceCalendar } from "@/components/sections/ComplianceCalendar";
import { JourneyTimeline } from "@/components/sections/JourneyTimeline";
import { ExpertHelp } from "@/components/sections/ExpertHelp";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "Tax & Compliance",
  description: "GST, TDS, income tax, PF/ESI, ROC filings and registrations — prepared from your live books and filed on a compliance calendar.",
};

export default function TaxCompliancePage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Tax & compliance" title="Every tax. One place to file it." lead="Returns are prepared from your live books, reconciled with the government portal, reviewed by you and filed on time. No exports, no re-typing." />
        </Reveal>
      </Container>
      <TaxCategories />
      <ComplianceCalendar />
      <JourneyTimeline />
      <ExpertHelp />
      <FinalCta title="File every return from one place." body="Start free, connect your GSTIN and see this month's returns prepared from your data." />
    </>
  );
}
```

- [ ] **Step 5: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/pages/tax.test.tsx tests/components/motion` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(tax): add tax & compliance page with filing categories and compliance calendar" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Pricing page

**Files:**
- Create: `components/sections/PricingTable.tsx`, `components/sections/ComparisonTable.tsx`, `components/sections/Faq.tsx`, `app/pricing/page.tsx`, `tests/components/sections/PricingTable.test.tsx`, `tests/pages/pricing.test.tsx`

**Interfaces:**
- Consumes: `plans`, `comparisonRows`, `faqs` (Task 4); `priceFor`, `formatInr`, `Billing` (Task 5); `RollingNumber`, `Reveal`, `Stagger`, `Accordion`, `Button`, `Badge`, `Card`, `SectionHeading`, `FinalCta`.
- Produces: `<PricingTable />`, `<ComparisonTable />`, `<Faq />`, route `/pricing/`.

- [ ] **Step 1: Write failing tests**

`tests/components/sections/PricingTable.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingTable } from "@/components/sections/PricingTable";

test("shows monthly prices by default and yearly equivalents after toggling", async () => {
  const user = userEvent.setup();
  render(<PricingTable />);
  expect(screen.getByLabelText("₹999")).toBeInTheDocument();
  expect(screen.getByLabelText("₹2,999")).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: /yearly/i }));
  expect(screen.getByLabelText("₹799")).toBeInTheDocument();
  expect(screen.getByLabelText("₹2,399")).toBeInTheDocument();
  expect(screen.getByText(/₹9,590 billed yearly/)).toBeInTheDocument();
});

test("marks the highlighted plan and shows custom pricing for Enterprise", () => {
  render(<PricingTable />);
  expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  expect(screen.getByText("Custom")).toBeInTheDocument();
  expect(screen.getByText("custom pricing")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /contact sales/i })).toHaveAttribute("href", "/contact/");
});
```

`tests/pages/pricing.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingPage from "@/app/pricing/page";

test("pricing page renders plans, comparison table and FAQ", () => {
  render(<PricingPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/pricing/i);
  for (const name of ["Free", "Growth", "Business", "Enterprise"]) {
    expect(screen.getAllByRole("heading", { level: 3, name }).length).toBeGreaterThan(0);
  }
  expect(screen.getByRole("table", { name: /compare plans/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /is there really a free plan/i })).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/sections/PricingTable.test.tsx tests/pages/pricing.test.tsx` → FAIL.

- [ ] **Step 2: Implement PricingTable**

`components/sections/PricingTable.tsx`:
```tsx
"use client";

import { useState } from "react";
import { m } from "motion/react";
import { Check } from "lucide-react";
import { plans } from "@/content/pricing";
import { priceFor, formatInr, type Billing } from "@/lib/pricing";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

const options: { id: Billing; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export function PricingTable() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <Container>
      <div role="radiogroup" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1">
        {options.map((o) => {
          const on = billing === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setBilling(o.id)} className={cn("relative rounded-full px-5 py-2 text-sm font-semibold transition-colors", on ? "text-white" : "text-text-muted hover:text-text")}>
              {on ? <m.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-primary" transition={spring} /> : null}
              <span className="relative z-10 flex items-center gap-2">
                {o.label}
                {o.id === "yearly" ? <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", on ? "bg-white/20 text-white" : "bg-accent/20 text-[#854F0B] dark:text-accent")}>Save 20%</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = priceFor(plan, billing);
          return (
            <StaggerItem key={plan.id} className="h-full">
              <div className={cn("h-full rounded-[1.35rem] p-px", plan.highlight ? "conic-border" : "bg-border")}>
                <article className={cn("relative flex h-full flex-col rounded-[1.3rem] bg-background p-6", plan.highlight && "shadow-lift")}>
                  {plan.highlight ? <Badge tone="accent" className="absolute -top-3 left-6">Most popular</Badge> : null}
                  <h3 className="font-display text-xl font-bold text-text">{plan.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{plan.users}</p>
                  <div className="mt-5 min-h-[4.5rem]">
                    {price.amount === null ? (
                      <p className="font-display text-4xl font-extrabold tracking-tight text-text">Custom</p>
                    ) : (
                      <p className="font-display text-4xl font-extrabold tracking-tight text-text">
                        <RollingNumber value={price.amount} format={formatInr} />
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">{price.note}</p>
                  </div>
                  <p className="mt-3 text-sm text-text-muted">{plan.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-sm text-text">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="mt-8" strength={0.12}>
                    <Button href={plan.cta.href} variant={plan.highlight ? "primary" : "outline"} className="w-full" arrow={plan.highlight}>{plan.cta.label}</Button>
                  </MagneticButton>
                </article>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-6 text-center text-xs text-text-muted">Prices exclude GST. Yearly plans are billed upfront.</p>
    </Container>
  );
}
```

- [ ] **Step 3: Implement ComparisonTable and Faq**

`components/sections/ComparisonTable.tsx`:
```tsx
import { Check, Minus } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { plans, comparisonRows } from "@/content/pricing";
import { cn } from "@/lib/cn";

export function ComparisonTable() {
  return (
    <Section tone="surface" id="compare">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Compare" title="Everything in every plan" />
        </Reveal>
        <Reveal className="mt-12 overflow-x-auto rounded-2xl border border-border bg-background shadow-soft">
          <table aria-label="Compare plans" className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="sticky left-0 bg-background px-5 py-4 font-medium text-text-muted">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className={cn("px-5 py-4 font-display text-base font-bold text-text", p.highlight && "text-primary")}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface/70">
                  <th scope="row" className="sticky left-0 bg-background px-5 py-3.5 font-medium text-text">{row.label}</th>
                  {plans.map((p) => {
                    const v = row.values[p.id];
                    return (
                      <td key={p.id} className="px-5 py-3.5 text-text-muted">
                        {v === true ? (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-primary-soft text-primary"><Check aria-hidden="true" className="size-3.5" strokeWidth={3} /><span className="sr-only">Included</span></span>
                        ) : v === false ? (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-surface text-text-muted"><Minus aria-hidden="true" className="size-3.5" /><span className="sr-only">Not included</span></span>
                        ) : (
                          v
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </Section>
  );
}
```

`components/sections/Faq.tsx`:
```tsx
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/content/faq";

export function Faq() {
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        </Reveal>
        <Reveal className="mt-12">
          <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, q: f.q, a: f.a }))} defaultOpen="faq-0" />
        </Reveal>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Implement the page**

`app/pricing/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PricingTable } from "@/components/sections/PricingTable";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for up to five users. Growth, Business and Enterprise plans in INR with GST filing, payroll and a dedicated CA. Save 20% on yearly billing.",
};

export default function PricingPage() {
  return (
    <>
      <Container className="pb-10 pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Pricing" title="Simple pricing that grows with you" lead="Start free. Pay only when you add people or modules. No setup fees, no lock-in." />
        </Reveal>
      </Container>
      <PricingTable />
      <ComparisonTable />
      <Faq />
      <FinalCta title="Not sure which plan?" body="Book a 20-minute demo and we'll map your departments to the right modules — and tell you honestly if the free plan is enough." />
    </>
  );
}
```

- [ ] **Step 5: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/components/sections/PricingTable.test.tsx tests/pages/pricing.test.tsx` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(pricing): add pricing page with billing toggle, rolling prices, conic highlight, comparison table and FAQ" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
### Task 15: Contact page with the Book-a-demo form

**Files:**
- Create: `components/forms/ContactForm.tsx`, `app/contact/page.tsx`, `tests/components/forms/ContactForm.test.tsx`, `tests/pages/contact.test.tsx`

**Interfaces:**
- Consumes: `contactSchema`, `ContactInput`, `ContactOutput`, `teamSizes` (Task 5); `submitForm`, `setFormTransport`; `modules`, `site` (Task 4); `Field`, `Input`, `Select`, `Checkbox`, `Textarea`, `Button`, `Card`; `FormStatus`.
- Produces: `<ContactForm />`, route `/contact/`.

- [ ] **Step 1: Write failing tests**

`tests/components/forms/ContactForm.test.tsx`:
```tsx
import { test, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/forms/ContactForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("shows inline errors for every required field on empty submit", async () => {
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  const alerts = await screen.findAllByRole("alert");
  const text = alerts.map((a) => a.textContent).join(" | ");
  expect(text).toMatch(/enter your name/i);
  expect(text).toMatch(/valid work email/i);
  expect(text).toMatch(/10-digit/i);
  expect(text).toMatch(/company name/i);
  expect(text).toMatch(/team size/i);
  expect(text).toMatch(/at least one module/i);
});

test("submits normalised data and shows success", async () => {
  const spy = vi.fn(async () => ({ ok: true as const }));
  setFormTransport(spy);
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "Priya@MeridianFoods.in");
  await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "11-50");
  await user.click(screen.getByLabelText("Accounting"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  await waitFor(() => expect(screen.getByText(/we'll be in touch/i)).toBeInTheDocument());
  expect(spy).toHaveBeenCalledWith("contact", expect.objectContaining({ email: "priya@meridianfoods.in", phone: "9876543210", modules: ["accounting"], teamSize: "11-50" }));
});

test("shows an error state with retry when the transport fails", async () => {
  setFormTransport(async () => ({ ok: false, error: "Could not reach the server" }));
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.type(screen.getByLabelText(/phone/i), "9876543210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "1-10");
  await user.click(screen.getByLabelText("Payroll"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  expect(await screen.findByText("Could not reach the server")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /retry/i }));
  expect(screen.getByRole("button", { name: /book my demo/i })).toBeEnabled();
});
```

`tests/pages/contact.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

test("contact page renders the form and contact details", () => {
  render(<ContactPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/book a demo/i);
  expect(screen.getByRole("form", { name: /book a demo/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /hello@allyouneed\.in/i })).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/forms/ContactForm.test.tsx tests/pages/contact.test.tsx` → FAIL.

- [ ] **Step 2: Implement ContactForm**

`components/forms/ContactForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { contactSchema, teamSizes, type ContactInput, type ContactOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { modules } from "@/content/modules";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { cn } from "@/lib/cn";

const teamSizeOptions = teamSizes.map((t) => ({ value: t, label: `${t} people` }));

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState, watch, setValue, reset } = useForm<ContactInput, unknown, ContactOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", modules: [], message: "" },
  });
  const selected = watch("modules") ?? [];
  const { errors } = formState;

  const toggleModule = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    setValue("modules", next, { shouldValidate: formState.isSubmitted, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setState("submitting");
    const res = await submitForm("contact", data);
    if (res.ok) {
      setState("success");
      reset();
    } else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Thanks — we'll be in touch within one working day." successBody="Watch for a calendar invite from hello@allyouneed.in. You can reply to it with anything you'd like us to prepare." />;
  }

  const busy = state === "submitting";
  return (
    <form onSubmit={onSubmit} noValidate aria-label="Book a demo" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" required error={errors.name?.message}>
          <Input autoComplete="name" placeholder="Priya Nair" disabled={busy} {...register("name")} />
        </Field>
        <Field id="email" label="Work email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="priya@company.in" disabled={busy} {...register("email")} />
        </Field>
        <Field id="phone" label="Phone" required error={errors.phone?.message} hint="10-digit Indian mobile, +91 optional">
          <Input type="tel" inputMode="numeric" autoComplete="tel" placeholder="+91 98765 43210" disabled={busy} {...register("phone")} />
        </Field>
        <Field id="company" label="Company" required error={errors.company?.message}>
          <Input autoComplete="organization" placeholder="Meridian Foods" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="teamSize" label="Team size" required error={errors.teamSize?.message}>
        <Select options={teamSizeOptions} placeholder="Choose a range" disabled={busy} {...register("teamSize")} />
      </Field>

      <fieldset aria-describedby={errors.modules ? "modules-error" : undefined} className="space-y-2">
        <legend className="text-sm font-medium text-text">
          Modules you're interested in <span className="text-primary">*</span>
        </legend>
        <div className={cn("flex flex-wrap gap-2", errors.modules && "rounded-xl ring-2 ring-red-500/40 ring-offset-2 ring-offset-background")}>
          {modules.map((mod) => (
            <Checkbox key={mod.slug} id={`module-${mod.slug}`} label={mod.name} checked={selected.includes(mod.slug)} onChange={() => toggleModule(mod.slug)} disabled={busy} />
          ))}
        </div>
        {errors.modules ? (
          <p id="modules-error" role="alert" className="text-sm text-red-600 dark:text-red-400">{errors.modules.message}</p>
        ) : null}
      </fieldset>

      <Field id="message" label="Anything specific? (optional)" error={errors.message?.message}>
        <Textarea placeholder="We run four retail branches and file GST under two GSTINs…" disabled={busy} {...register("message")} />
      </Field>

      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />

      <Button type="submit" size="lg" disabled={busy} arrow={!busy} className="w-full sm:w-auto">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Book my demo"}
      </Button>
      <p className="text-xs text-text-muted">By submitting you agree to our <a href="/privacy/" className="link-underline text-text">privacy policy</a>. No spam, ever.</p>
    </form>
  );
}
```

- [ ] **Step 3: Implement the page**

`app/contact/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact & book a demo",
  description: "Book a 20-minute demo of Allyouneed, or reach the team by email and phone.",
};

const steps = [
  { n: "1", t: "We confirm a slot", b: "Within one working day, on email and WhatsApp." },
  { n: "2", t: "20-minute walkthrough", b: "Your departments, mapped to modules — with your sample data if you share it." },
  { n: "3", t: "Free workspace", b: "Leave the call with a live account and an import plan." },
];

export default function ContactPage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Contact" title="Book a demo" lead="Tell us a little about your business and we'll show you Allyouneed running the way you work." />
        </Reveal>
      </Container>
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal variant="scaleIn">
            <Card className="p-6 sm:p-8">
              <ContactForm />
            </Card>
          </Reveal>
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <Card>
                <h2 className="font-display text-lg font-bold text-text">Reach us directly</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex gap-3"><Mail aria-hidden="true" className="size-5 shrink-0 text-primary" /><a href={`mailto:${site.email}`} className="link-underline text-text">{site.email}</a></li>
                  <li className="flex gap-3"><Phone aria-hidden="true" className="size-5 shrink-0 text-primary" /><a href={site.phoneHref} className="link-underline text-text">{site.phone}</a></li>
                  <li className="flex gap-3"><MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" /><span className="text-text-muted">{site.address}</span></li>
                  <li className="flex gap-3"><Clock aria-hidden="true" className="size-5 shrink-0 text-primary" /><span className="text-text-muted">{site.hours}</span></li>
                </ul>
              </Card>
            </Reveal>
            <Stagger className="space-y-3">
              <StaggerItem><h2 className="font-display text-lg font-bold text-text">What happens next</h2></StaggerItem>
              {steps.map((s) => (
                <StaggerItem key={s.n}>
                  <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display font-bold text-white">{s.n}</span>
                    <div>
                      <p className="font-semibold text-text">{s.t}</p>
                      <p className="text-sm text-text-muted">{s.b}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/components/forms tests/pages/contact.test.tsx` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(contact): add book-a-demo form with inline validation, module picker and contact details" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 16: About page and legal pages

**Files:**
- Create: `components/sections/LegalLayout.tsx`, `app/about/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/refund/page.tsx`, `tests/pages/about-legal.test.tsx`

**Interfaces:**
- Consumes: `about` (Task 4), `compliance` (Task 4), `termsDoc/privacyDoc/refundDoc`, `LegalDoc`; ui/motion primitives; `FinalCta`.
- Produces: `<LegalLayout doc: LegalDoc />`, routes `/about/`, `/terms/`, `/privacy/`, `/refund/`.

- [ ] **Step 1: Write the failing tests**

`tests/pages/about-legal.test.tsx`:
```tsx
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";
import TermsPage from "@/app/terms/page";
import PrivacyPage from "@/app/privacy/page";
import RefundPage from "@/app/refund/page";
import { about } from "@/content/about";

test("about page renders mission, values and security", () => {
  render(<AboutPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/growing businesses/i);
  for (const v of about.values) expect(screen.getByRole("heading", { level: 3, name: v.title })).toBeInTheDocument();
  expect(screen.getByText(/designed to align with/i)).toBeInTheDocument();
});

test.each([
  ["terms", TermsPage, /terms & conditions/i],
  ["privacy", PrivacyPage, /privacy policy/i],
  ["refund", RefundPage, /refund policy/i],
] as const)("%s page renders the document with a review notice and TOC", (_, Page, title) => {
  const { unmount } = render(<Page />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  expect(screen.getByText(/have a lawyer review/i)).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: /contents/i }).querySelectorAll("a").length).toBeGreaterThanOrEqual(4);
  expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  unmount();
});
```

Run: `npx vitest run tests/pages/about-legal.test.tsx` → FAIL.

- [ ] **Step 2: Implement LegalLayout and the legal pages**

`components/sections/LegalLayout.tsx`:
```tsx
import { TriangleAlert } from "lucide-react";
import type { LegalDoc } from "@/content/legal";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export function LegalLayout({ doc }: { doc: LegalDoc }) {
  return (
    <Container className="py-8 sm:py-12">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-text-muted">Last updated {fmt.format(new Date(doc.updated))}</p>
        <div role="note" className="mt-6 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-text">
          <TriangleAlert aria-hidden="true" className="size-5 shrink-0 text-[#854F0B] dark:text-accent" />
          <p>Sample text: have a lawyer review this document before launch. It is written with the DPDP Act 2023 in mind but is not legal advice.</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contents" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Contents</p>
          <ol className="mt-3 space-y-1.5 border-l border-border text-sm">
            {doc.sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#section-${i + 1}`} className="block px-4 py-1 text-text-muted transition-colors hover:text-primary">{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="max-w-3xl">
          <p className="text-lg text-text-muted">{doc.intro}</p>
          {doc.sections.map((s, i) => (
            <Reveal key={s.heading} as="section" className="mt-10 scroll-mt-28">
              <h2 id={`section-${i + 1}`} className="font-display text-xl font-bold text-text">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-text-muted">{p}</p>
              ))}
            </Reveal>
          ))}
        </article>
      </div>
    </Container>
  );
}
```

Note: `Reveal` accepts `as="section"` (defined in Task 7). The `id` must sit on the `h2` so TOC links land on the heading.

`app/terms/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { termsDoc } from "@/content/legal";

export const metadata: Metadata = { title: "Terms & Conditions", description: "Terms governing use of the Allyouneed platform." };

export default function TermsPage() {
  return <LegalLayout doc={termsDoc} />;
}
```

`app/privacy/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { privacyDoc } from "@/content/legal";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Allyouneed collects, uses and protects personal data under the DPDP Act 2023." };

export default function PrivacyPage() {
  return <LegalLayout doc={privacyDoc} />;
}
```

`app/refund/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { refundDoc } from "@/content/legal";

export const metadata: Metadata = { title: "Refund Policy", description: "When Allyouneed subscription fees are refunded." };

export default function RefundPage() {
  return <LegalLayout doc={refundDoc} />;
}
```

- [ ] **Step 3: Implement the About page**

`app/about/page.tsx`:
```tsx
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { about } from "@/content/about";
import { compliance } from "@/content/nav";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "About",
  description: "Why Allyouneed exists, what we believe, and how we keep your data safe.",
};

export default function AboutPage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <AnimatedLogo size={80} />
            <SectionHeading as="h1" className="mt-6" eyebrow="About Allyouneed" title="Built so growing businesses can run like big ones" lead={about.mission} />
          </div>
        </Reveal>
      </Container>

      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">Our story</h2>
          </Reveal>
          {about.story.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="mt-5 text-lg leading-relaxed text-text-muted">{p}</p>
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Values" title="What we optimise for" />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((v) => (
              <StaggerItem key={v.title} className="h-full">
                <Card hover className="group h-full">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-500 group-hover:-rotate-6"><v.icon aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-4 font-display text-lg font-bold text-text">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{v.body}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Security & compliance" title="Your data, treated like ours" />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.security.map((s) => (
              <StaggerItem key={s.title} className="h-full">
                <Card hover className="h-full">
                  <s.icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-bold text-text">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-8">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-text"><ShieldCheck aria-hidden="true" className="size-4 text-primary" /> Designed to align with</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {compliance.map((c) => (
                  <li key={c.code} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-muted" title={c.label}>{c.code} · {c.label}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta title="Come run your business with us." body="Start free today, or book a demo and meet the team." />
    </>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/pages/about-legal.test.tsx` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(pages): add about page and terms/privacy/refund legal pages with shared layout" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 17: Login and Register (visual only)

**Files:**
- Create: `components/sections/AuthLayout.tsx`, `components/forms/PasswordInput.tsx`, `components/forms/LoginForm.tsx`, `components/forms/RegisterForm.tsx`, `app/login/page.tsx`, `app/register/page.tsx`, `tests/components/forms/AuthForms.test.tsx`

**Interfaces:**
- Consumes: `loginSchema`, `registerSchema` + Input/Output types (Task 5); `submitForm`; `AnimatedLogo`, `BrowserFrame`, `DashboardMock`, `TiltCard`; ui primitives; `FormStatus`.
- Produces: `<AuthLayout title lead children footer />`, `<PasswordInput ...inputProps />`, `<LoginForm />`, `<RegisterForm />`, routes `/login/`, `/register/` (both `robots: { index: false }`).

- [ ] **Step 1: Write failing tests**

`tests/components/forms/AuthForms.test.tsx`:
```tsx
import { test, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("login shows the coming-soon notice after a valid submit and never sends the password", async () => {
  const calls: unknown[] = [];
  setFormTransport(async (_kind, data) => {
    calls.push(data);
    return { ok: true };
  });
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText(/work email/i), "rhea@meridianfoods.in");
  await user.type(screen.getByLabelText(/^password/i), "secret123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  await waitFor(() => expect(screen.getByText(/coming soon/i)).toBeInTheDocument());
  expect(JSON.stringify(calls)).not.toContain("secret123");
});

test("password visibility toggle works", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  const pw = screen.getByLabelText(/^password/i);
  expect(pw).toHaveAttribute("type", "password");
  await user.click(screen.getByRole("button", { name: /show password/i }));
  expect(pw).toHaveAttribute("type", "text");
});

test("register enforces password length", async () => {
  const user = userEvent.setup();
  render(<RegisterForm />);
  await user.type(screen.getByLabelText(/^password/i), "short");
  await user.click(screen.getByRole("button", { name: /create/i }));
  expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
});
```

Run: `npx vitest run tests/components/forms/AuthForms.test.tsx` → FAIL.

- [ ] **Step 2: Implement PasswordInput, LoginForm, RegisterForm**

`components/forms/PasswordInput.tsx`:
```tsx
"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text"
      >
        {show ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
});
```

`Field` clones its direct child; `PasswordInput`'s root is a `<div>`, so `Field` would put `id` on the wrapper. Make `PasswordInput` forward `id` and aria props to the inner `Input` explicitly: since `{...props}` already spreads onto `Input` (including `id`, `aria-invalid`, `aria-describedby` that `Field` injects), this works as written — the wrapper `div` receives nothing. ✔

`components/forms/LoginForm.tsx` (the password is deliberately stripped before anything leaves the component):
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { loginSchema, type LoginInput, type LoginOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState } = useForm<LoginInput, unknown, LoginOutput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async ({ email }) => {
    setState("submitting");
    const res = await submitForm("login", { email }); // no backend yet — the password never leaves the browser
    if (res.ok) setState("success");
    else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Coming soon: the Allyouneed app is launching shortly." successBody="We've noted your interest. You'll get an email the moment login opens." />;
  }

  const busy = state === "submitting";
  return (
    <form onSubmit={onSubmit} noValidate aria-label="Log in" className="space-y-5">
      <Field id="login-email" label="Work email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="login-password" label="Password" required error={formState.errors.password?.message}>
        <PasswordInput autoComplete="current-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Signing in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        New to Allyouneed? <Link href="/register/" className="link-underline font-medium text-primary">Create a free account</Link>
      </p>
    </form>
  );
}
```

`components/forms/RegisterForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { registerSchema, type RegisterInput, type RegisterOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState } = useForm<RegisterInput, unknown, RegisterOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, phone, company }) => {
    setState("submitting");
    const res = await submitForm("register", { name, email, phone, company }); // password intentionally omitted
    if (res.ok) setState("success");
    else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Coming soon: the Allyouneed app is launching shortly." successBody="You're on the early-access list. We'll email you when your workspace is ready." />;
  }

  const busy = state === "submitting";
  const e = formState.errors;
  return (
    <form onSubmit={onSubmit} noValidate aria-label="Create account" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-name" label="Full name" required error={e.name?.message}>
          <Input autoComplete="name" placeholder="Arjun Mehta" disabled={busy} {...register("name")} />
        </Field>
        <Field id="reg-company" label="Company" required error={e.company?.message}>
          <Input autoComplete="organization" placeholder="Vasant Interiors" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="reg-email" label="Work email" required error={e.email?.message}>
        <Input type="email" autoComplete="email" placeholder="arjun@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="reg-phone" label="Phone" required error={e.phone?.message} hint="10-digit Indian mobile, +91 optional">
        <Input type="tel" inputMode="numeric" autoComplete="tel" placeholder="+91 98765 43210" disabled={busy} {...register("phone")} />
      </Field>
      <Field id="reg-password" label="Password" required error={e.password?.message} hint="At least 8 characters">
        <PasswordInput autoComplete="new-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy} arrow={!busy} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Creating…" : "Create free account"}
      </Button>
      <p className="text-center text-xs text-text-muted">
        By continuing you agree to the <Link href="/terms/" className="link-underline text-text">terms</Link> and <Link href="/privacy/" className="link-underline text-text">privacy policy</Link>.
      </p>
      <p className="text-center text-sm text-text-muted">
        Already have an account? <Link href="/login/" className="link-underline font-medium text-primary">Log in</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Implement AuthLayout and the pages**

`components/sections/AuthLayout.tsx`:
```tsx
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { TiltCard } from "@/components/motion/TiltCard";
import { BrowserFrame, DashboardMock } from "@/components/mockups";

const proof = ["Free for up to 5 users", "GST-ready in a day", "Import from Tally or Excel"];

export function AuthLayout({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <Reveal variant="scaleIn" className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#6A61CF] to-[#7F77DD] p-10 text-white lg:block">
          <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-25" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-accent/30 blur-3xl animate-aurora" />
          <div className="relative flex h-full flex-col">
            <AnimatedLogo size={64} />
            <h2 className="mt-8 font-display text-3xl font-extrabold tracking-tight">Everything your business runs on. One OS.</h2>
            <ul className="mt-6 space-y-2.5">
              {proof.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-white/90"><Check aria-hidden="true" className="size-4" strokeWidth={3} /> {p}</li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <TiltCard max={6}>
                <BrowserFrame url="app.allyouneed.in/dashboard" className="dark">
                  <DashboardMock compact />
                </BrowserFrame>
              </TiltCard>
            </div>
          </div>
        </Reveal>
        <Reveal className="flex items-center">
          <Card className="w-full p-6 sm:p-10">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">{title}</h1>
            <p className="mt-2 text-text-muted">{lead}</p>
            <div className="mt-8">{children}</div>
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}
```

`app/login/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" lead="Log in to your Allyouneed workspace.">
      <LoginForm />
    </AuthLayout>
  );
}
```

`app/register/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = { title: "Create your free account", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <AuthLayout title="Start free" lead="Five users, accounting and CRM, no card needed. Upgrade whenever you're ready.">
      <RegisterForm />
    </AuthLayout>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, lint; commit**

Run: `npx vitest run tests/components/forms/AuthForms.test.tsx` → pass. `npm run typecheck`, `npm run lint` → clean.

```bash
git add -A
git commit -m "feat(auth): add visual-only login and register pages with coming-soon flow" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 18: Page transitions, 404, scroll chrome, SEO metadata routes

**Files:**
- Create: `app/template.tsx`, `app/not-found.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `tests/app/metadata-routes.test.ts`
- Modify: `app/layout.tsx` (metadataBase, Open Graph, icons; mount `ScrollProgress` + `BackToTop`)

**Interfaces:**
- Consumes: `site.url` (Task 4), `ScrollProgress`, `BackToTop`, `AnimatedLogo`, `Button`.
- Produces: `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` in the static export; route fade/rise transitions; branded 404.

- [ ] **Step 1: Write the failing metadata-route test**

`tests/app/metadata-routes.test.ts`:
```ts
import { test, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { site } from "@/content/site";

const routes = ["/", "/features/", "/tax-compliance/", "/pricing/", "/contact/", "/about/", "/terms/", "/privacy/", "/refund/"];

test("sitemap lists every public route (not login/register)", () => {
  const urls = sitemap().map((e) => e.url);
  for (const r of routes) expect(urls).toContain(`${site.url}${r}`);
  expect(urls.some((u) => u.includes("/login"))).toBe(false);
  expect(urls.some((u) => u.includes("/register"))).toBe(false);
});

test("robots allows crawling and points at the sitemap", () => {
  const r = robots();
  expect(r.sitemap).toBe(`${site.url}/sitemap.xml`);
  expect(JSON.stringify(r.rules)).toContain('"allow":"/"');
});

test("manifest has the brand name, colors and PNG icons", () => {
  const mf = manifest();
  expect(mf.name).toBe("Allyouneed");
  expect(mf.theme_color).toBe("#534AB7");
  expect(mf.icons?.map((i) => i.src)).toEqual(["/brand/icon-192.png", "/brand/icon-512.png"]);
});
```

Run: `npx vitest run tests/app` → FAIL.

- [ ] **Step 2: Implement metadata routes**

`app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

const publicRoutes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/features/", priority: 0.9 },
  { path: "/tax-compliance/", priority: 0.9 },
  { path: "/pricing/", priority: 0.9 },
  { path: "/contact/", priority: 0.8 },
  { path: "/about/", priority: 0.6 },
  { path: "/terms/", priority: 0.3 },
  { path: "/privacy/", priority: 0.3 },
  { path: "/refund/", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((r) => ({ url: `${site.url}${r.path}`, changeFrequency: "monthly", priority: r.priority }));
}
```

`app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/login/", "/register/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```

`app/manifest.ts`:
```ts
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Allyouneed",
    short_name: "Allyouneed",
    description: "Everything your business runs on. One OS.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#534AB7",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 3: Implement template.tsx and not-found.tsx**

`app/template.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
      {children}
    </m.div>
  );
}
```

`app/not-found.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AnimatedLogo size={88} />
      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-primary">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">That page isn't in the ledger.</h1>
      <p className="mt-4 max-w-md text-text-muted">The link may be old or mistyped. Everything you need is one click from the home page.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" arrow>Back to home</Button>
        <Button href="/contact/" variant="outline">Contact us</Button>
      </div>
    </Container>
  );
}
```

- [ ] **Step 4: Finish `app/layout.tsx` metadata and scroll chrome**

Replace the `metadata` export with:
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Allyouneed — Everything your business runs on. One OS.", template: "%s · Allyouneed" },
  description: site.description,
  applicationName: "Allyouneed",
  keywords: ["business OS", "ERP India", "GST filing software", "payroll software India", "accounting software", "CRM", "inventory POS"],
  openGraph: {
    type: "website",
    siteName: "Allyouneed",
    locale: "en_IN",
    url: site.url,
    title: "Allyouneed — Everything your business runs on. One OS.",
    description: site.description,
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Allyouneed — Everything your business runs on. One OS." }],
  },
  twitter: { card: "summary_large_image", title: "Allyouneed", description: site.description, images: ["/brand/og.png"] },
  icons: { icon: "/icon.svg", apple: "/brand/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
  ],
};
```
Add imports `import type { Metadata, Viewport } from "next";`, `import { site } from "@/content/site";`, `import { ScrollProgress } from "@/components/motion/ScrollProgress";`, `import { BackToTop } from "@/components/motion/BackToTop";`. Inside `<Providers>`, render `<ScrollProgress />` before `<Navbar />` and `<BackToTop />` after `<Footer />`.

- [ ] **Step 5: Run everything and verify the export**

Run: `npm test` → all pass. `npm run typecheck`, `npm run lint` → clean. `npx next build` → the route table lists `/`, `/about`, `/contact`, `/features`, `/login`, `/manifest.webmanifest`, `/pricing`, `/privacy`, `/refund`, `/register`, `/robots.txt`, `/sitemap.xml`, `/tax-compliance`, `/terms`, `/_not-found`, all `○ (Static)`.

Then verify (Bash): `ls out/sitemap.xml out/robots.txt out/manifest.webmanifest out/brand/og.png out/icon.svg && grep -o 'og:image" content="[^"]*"' out/index.html`
Expected: all files listed; `og:image` points at `https://allyouneed.in/brand/og.png`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(app): add route transitions, branded 404, scroll progress and back-to-top, Open Graph metadata, sitemap, robots and manifest" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 19: Final verification — build, browser walkthrough, motion checklist, README

**Files:**
- Create: `.claude/launch.json`, `README.md`
- Modify: anything the walkthrough shows is broken (each fix is its own `fix:` commit)

**Interfaces:**
- Consumes: the whole site.
- Produces: a verified, documented, committed site in `out/` ready for any static host.

- [ ] **Step 1: Run the full gate**

Run in order and paste the tail of each output into your report:
```bash
npm test
```
```bash
npm run typecheck
```
```bash
npm run lint
```
```bash
npm run build
```
All four must exit 0. Do not continue until they do.

- [ ] **Step 2: Create the dev-server launch config and open the site in the browser pane**

`.claude/launch.json`:
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "allyouneed", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```
Use `mcp__Claude_Browser__preview_start` with `name: "allyouneed"`. Wait for `http://localhost:3000` to load.

- [ ] **Step 3: Walk every route at desktop width, light theme**

For each of `/`, `/features/`, `/tax-compliance/`, `/pricing/`, `/contact/`, `/about/`, `/terms/`, `/privacy/`, `/refund/`, `/login/`, `/register/`, `/does-not-exist/`:
1. `navigate` to it, take a `screenshot` (scale 0.5 is fine), scroll through the page in 3–4 steps taking screenshots.
2. `read_console_messages` with `onlyErrors: true` — must be empty (hydration warnings count as errors to fix).
3. `javascript_tool`: `document.documentElement.scrollWidth <= window.innerWidth` — must be `true`.
Record any visual defect (overlap, clipped text, unreadable contrast, broken layout) in a list.

- [ ] **Step 4: Repeat at mobile width and in dark mode**

`resize_window` preset `mobile`, reload, and repeat Step 3 on every route (mobile drawer: open it, confirm links, close with the X). Then `resize_window` preset `desktop` and `colorScheme: "dark"`, reload, and repeat Step 3 on `/`, `/pricing/`, `/contact/`, `/login/` at minimum (all routes if time allows). Finally set `colorScheme: "light"`.

- [ ] **Step 5: Motion checklist (desktop, light)**

On `/`, confirm each of these visibly happens and note the result:
1. Hero: logo tiles assemble, amber tile springs in last; headline words blur-in one after another; CTAs appear after.
2. Hero background drifts slowly; a soft spotlight follows the cursor (`hover` over the hero, screenshot twice at different positions).
3. Dashboard mockup tilts when hovering at its corners; the three floating chips bob.
4. Trust bar logos scroll continuously and pause when hovered; the four counters count up when scrolled into view.
5. Module showcase: the pill slides between tabs when clicking; a progress bar fills under the active tab and it auto-advances after ~6s when not interacted with.
6. Module cards: a spotlight glow and border highlight follow the cursor; the card lifts and the icon tilts.
7. "Record once": the connector line fills as you scroll and steps light up in order.
8. Journey timeline: the progress line fills and dots pulse as you scroll.
9. Mobile app section: the two phones move at different speeds while scrolling.
10. Navbar becomes a glass bar after scrolling ~30px, hides on scroll down, reappears on scroll up; the active-page pill is on the correct link on `/pricing/`.
11. Theme toggle: the icon morphs and the theme changes in a circular sweep from the button (Chromium supports View Transitions).
12. Reading-progress bar at the very top grows with scroll; back-to-top button appears after one viewport and scrolls smoothly to the top.
13. `/pricing/`: switching to Yearly rolls the digits; the Growth card has a slowly rotating gradient border.
14. Navigating between pages fades/rises the content in.
15. Buttons: primary CTAs pull toward the cursor slightly and show a shine sweep on hover; arrows nudge right; footer links draw an underline.

- [ ] **Step 6: Reduced-motion and no-JS sanity**

Reduced motion cannot be emulated from the browser pane, so rely on the unit tests that mock `useReducedMotion` (Reveal, CountUp, ModuleShowcase) and additionally grep: `Grep pattern "useReducedMotion" path components` — every file listed must render its final state when the hook returns `true`; open any file not covered by a test and confirm by reading it. For no-JS, `javascript_tool`: `document.querySelectorAll('[data-reveal]').length > 0` — confirms the `<noscript>` rule has targets.

- [ ] **Step 7: Fix what you found**

For each defect: fix it, re-run `npm test && npm run typecheck && npm run lint`, re-check in the browser, and commit with a `fix:` message. Typical fixes: `scroll-mt` on anchored sections under the fixed navbar, `overflow-x-hidden` on a section whose decorative blob overflows at 375px, contrast of `text-text-muted` on `bg-surface` in dark mode.

- [ ] **Step 8: Optional Lighthouse**

If Chrome is available: `npx --yes lighthouse http://localhost:3000 --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=./.lighthouse.json` and report the four category scores (target ≥90). If Chrome is not installed the command fails quickly — record "Lighthouse not run: Chrome unavailable" and move on. Add `.lighthouse.json` to `.gitignore`.

- [ ] **Step 9: Write `README.md`**

```markdown
# Allyouneed — website

Marketing site and brand kit for Allyouneed, the business OS for growing Indian companies. Next.js 16 (App Router, static export), Tailwind CSS 4, Motion.

## Scripts

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — static export to `out/` (deploy that folder to any static host)
- `npm test` / `npm run typecheck` / `npm run lint`
- `npm run brand` — re-render `public/brand/*.png` from the SVGs (run after editing a brand SVG)

## Where things live

- **Copy and data:** `content/*.ts` — every heading, bullet, price, FAQ, testimonial and legal paragraph. Items marked `// PLACEHOLDER` are fictional and must be replaced before launch (stats, customer names, testimonials, prices, contact details, the domain in `content/site.ts`).
- **Forms:** all submissions go through `lib/forms.ts → submitForm()`. It currently waits 800 ms and succeeds. To send real data, replace its body with a `fetch()` to Formspree or your API — nothing else changes.
- **Brand:** `public/brand/` (SVG sources + generated PNGs), `components/brand/`.
- **Motion:** `lib/motion.ts` (tokens) and `components/motion/` (primitives). Everything honours `prefers-reduced-motion`.
- **Legal pages:** sample text in `content/legal/`. Have a lawyer review before launch.

## Deploy

`npm run build`, then upload `out/` (Vercel, Netlify, Cloudflare Pages, S3 — anything that serves static files). Set the real domain in `content/site.ts` first so `sitemap.xml`, `robots.txt` and Open Graph URLs are correct.
```

- [ ] **Step 10: Final commit and report**

```bash
git add -A
git commit -m "docs: add README with scripts, content map, form hookup and deploy notes" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git log --oneline
```
Report: the four gate outputs, the per-route walkthrough results (desktop/mobile/dark), the motion checklist with any items that did not behave, fixes made, and the Lighthouse result or the reason it was skipped.

---

## Self-review notes (already applied)

- Spec §3 brand → Task 3; §4 routes → Tasks 11–18 (all 11 routes + 404); §5 file layout → Tasks 1–9; §6 forms → Tasks 5, 8, 15, 17; §6 motion signature moments 1–17 → Tasks 7, 8, 10, 11, 14, 18 and verified in Task 19 Step 5; §6 SEO → Task 18; §7 tests → each task's Step 1 plus Task 19.
- `Field` requires the control to be the direct child (Tasks 8, 15, 17 obey this).
- `useForm<Input, unknown, Output>` is used in every form (Tasks 8, 15, 17) because the zod schemas transform phone/email.
- `SpotlightCard` takes an optional `id` (Task 7) that Task 13 uses for the tax-category anchors.
- `AnimatedLogo` animates `<m.g>` wrappers, not `<m.rect>`, because motion maps `x`/`y` on SVG elements to translate transforms; the hero chips use motion's `z` style value for depth for the same reason.
- `domMax` (not `domAnimation`) is loaded in Task 2 because `layoutId` is used in Tasks 8, 10, 12, 14.
