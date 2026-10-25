# Supabase setup and handover

This site now has sign-up, log in, log out, password reset, a protected account page, and contact / newsletter forms that store their data in Supabase. This guide says what exists, what has and has not been verified, and exactly what you need to do to switch it on.

**Read this first: the account flows that need an email inbox have still not been run against a real Supabase project.** The database rules and the two forms have now been verified on the real project (see "Verified on the live project" in section 1). Everything else was verified in two substitute ways (a Postgres engine running the migration, and the real browser client talking to a local stand-in server). Section 5 is the checklist that closes the remaining gap.

---

## 1. Status: what is done, tested, untested, blocked

| Item | Built | How it was verified | Still unverified |
|---|---|---|---|
| Database schema, constraints, RLS (`supabase/migrations/…_init_profiles_and_forms.sql`) | Yes | 33 automated checks on a real Postgres engine (PGlite) with a hand-written stand-in for Supabase's roles and `auth` schema, including a re-run test; plus a check that each protection really is what blocks access (turning it off opens the leak) | On a hosted project: that the migration applies cleanly, the `auth.users` trigger fires, and Supabase's default privileges behave as the stand-in assumes |
| Sign-up, email confirmation, log in, log out, session persistence | Yes | Automated tests; and walked through in a real browser with the real `supabase-js` client against a local stand-in server | Email delivery, your redirect-URL allow-list, your email templates, real Supabase error responses |
| Password reset (request, emailed link, choose new password) | Yes | Same two ways | Same as above |
| Protected page `/account/` (view and edit your own profile) | Yes | Automated tests; real browser against the stand-in | RLS on the real database |
| Contact form → `contact_requests`, newsletter → `subscribe_to_newsletter()` | Yes | Automated tests; real browser against the stand-in; SQL on PGlite | Real inserts |
| Secrets safety (no privileged key can reach the browser) | Yes | Automated tests; the built bundle was searched | — |
| Behaviour with no Supabase settings | Yes | Automated tests; real browser | — |
| Placeholder content and office hours | Yes | Automated tests; looked at in the browser | — |
| `supabase/config.toml` for the Supabase CLI's local stack | Minimal, hand-written | Not run | Never run with the CLI |
| Deployment | **Not done** | — | You host it (section 7) |
| Anything needing your real values | **Blocked on you** | — | Supabase URL and key, real statistics, customers, testimonials, contact details (sections 3 and 6) |

Automated suite at the time of writing: 70 test files, 399 tests, typecheck and lint clean, production build succeeds with every page exported as static HTML.

### Verified on the live project (2026-10-25)

After the owner applied the migration in the SQL Editor, these were checked against the real project, using only the public key (no test accounts were created):

- **Tables exist** and an anonymous read of each of `contact_requests`, `newsletter_subscribers` and `profiles` is **refused** (`42501 permission denied`).
- **Contact form storage:** an anonymous insert returns **201**. The client **cannot** set `status` or `user_id` (refused). The database **rejects** a bad email, a bad phone, a `NULL` module and an unknown team size (`23514`).
- **Newsletter:** the function returns **204**; subscribing the same address again also returns 204 (silent); a malformed email or bad WhatsApp number is rejected; the table itself is closed to direct inserts.
- **Through the website in a browser:** the contact form got **201** from the project's `contact_requests` and the footer form **204** from `subscribe_to_newsletter`; `/account/` signed-out redirects to `/login/?next=…`; opening `/auth/callback/` with an invalid code shows the plain explanation; a login with fake credentials is refused with the friendly message (and creates nothing).
- **Project settings (public endpoint):** email provider on, sign-ups open, email confirmation required, no social providers.
- **Build guard:** the project's publishable key is accepted; a service-role key stops the build.

**Still NOT verified on the live project** (each needs an inbox or a real account, so the owner does these; see section 5B and 5C): sign-up and the confirmation email arriving; the confirmation link; a successful login; the account page and profile edit; the sign-up trigger creating the profile row; the password-reset email and link; changing a password; the redirect-URL allow-list; SMTP. Test rows created by the checks above are listed in the hand-over message and can be deleted with the SQL in section 5D.

### How the two substitute checks work (so you can judge them)

- **PGlite:** `tests/db/migration.test.ts` creates the `anon`, `authenticated` and `service_role` roles, an `auth.users` table and `auth.uid()`, grants everything on new tables to the API roles (as Supabase does), then runs the migration and tests each rule as each role. It proves the SQL is valid and the rules do what they say. It is not Supabase.
- **Stand-in server:** a throwaway local server answering the same HTTP endpoints as Supabase Auth and the data API. It let the real browser client log in, store a session, reload, log out, sign up, exchange an email-link code, reset a password, edit a profile and submit both forms. It proves *our* code and the request shapes. It is not Supabase.

### An important limit of this architecture

This site is a **static export**: plain files, no server. So:

- Log in happens in the visitor's browser, talking straight to Supabase with the **public** key.
- `/account/` cannot be locked on the server. Its page is a public file; it just shows nothing to a visitor with no session. **What actually protects the data is Row Level Security in the database.** Never put private information in the page source.
- Spam protection on the contact and newsletter forms can only be the database's input checks. Real rate limiting needs more (section 8).

---

## 2. Create the Supabase project and find your keys

1. Sign in at <https://supabase.com/dashboard> and choose **New project**. Pick a strong database password (store it in a password manager; this site never needs it).
2. **Region:** for Indian users, *Mumbai (ap-south-1)* is the closest. This is also a data-residency decision for your privacy policy; choose deliberately because it cannot be changed later.
3. When the project is ready, open **Project Settings** and find:
   - **Project URL** (under *Data API* or *API*): looks like `https://abcdefghijklmnop.supabase.co`.
   - **Publishable key** (under *API Keys*): starts with `sb_publishable_`. On an older project you may only see the legacy **anon** key (a long string starting `eyJ`); that works too.
4. **Do not copy the *secret* key or the *service_role* key anywhere in this repo.** They bypass all security. The build refuses to run with one (see section 3).

Dashboard menus get renamed from time to time. If you can't find an item, use the dashboard's search box.

---

## 3. Environment variables

| Variable | Value | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Project Settings → Data API / API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Project Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | legacy anon key (only if you have no publishable key) | Project Settings → API Keys (legacy) |

Set **only the URL and one key**. Both are public by design: Next.js copies any `NEXT_PUBLIC_*` variable into the JavaScript every visitor downloads. Their secrecy is not what protects your data; Row Level Security is.

**Where to put them**

- **Local development:** copy `.env.example` to `.env.local` (git ignores it) and replace the two placeholder values. Restart `npm run dev`.
- **Hosting:** add the same variables to your host's **build** environment: Vercel (Project → Settings → Environment Variables), Netlify (Site configuration → Environment variables), Cloudflare Pages (Settings → Variables and Secrets, for *build*). Because this is a static export, the values are baked in when `npm run build` runs: **changing them later means rebuilding and redeploying.**

**Safety rails already in the code**

- **The build fails** if any `NEXT_PUBLIC_*` variable holds a secret key (`sb_secret_…`) or a `service_role` JWT (or is named like one, such as `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`). This check is in `next.config.ts`, so it also stops `npm run dev`. It has to be the build that stops: Next.js copies the value of every `NEXT_PUBLIC_*` variable into the published JavaScript whether or not the code uses it. If you ever see this error, remove the value **and rotate that key in the Supabase dashboard** if it was ever deployed.
- As a second layer, the browser client also refuses to use such a key and logs a console error.
- The untouched placeholders from `.env.example` count as "not configured".
- A test fails if any source file mentions a service key, reads any other environment variable, or hard-codes a project URL or key.

With no (or invalid) settings the site still builds and runs. Log in and sign-up show "Accounts aren't switched on for this site yet" with the button disabled, `/account/` shows the same notice, and the contact / newsletter forms say plainly that nothing was sent and point to the contact email. They never pretend to succeed.

---

## 4. Apply the database migration

The migration file is `supabase/migrations/20261025000000_init_profiles_and_forms.sql`. It is safe to run more than once.

**Option A: SQL Editor (simplest)**

1. In the dashboard open **SQL Editor** → **New query**.
2. Paste the whole file and press **Run**. It should finish with "Success. No rows returned".

**Option B: Supabase CLI**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

(`supabase/config.toml` is hand-written and has never been run with the CLI; if `link` or `push` complains about it, delete the file. Hosted projects don't need it.)

**What it creates**

| Table | Who can do what through the API (browser) |
|---|---|
| `profiles` | A signed-in user can **read** and **edit** (`full_name`, `company`, `phone` only) **their own row**. Nobody can insert or delete rows. A row is created automatically when someone signs up (a trigger copies the sign-up details), and removed when the user is deleted. |
| `contact_requests` (the Book-a-demo form) | Anyone can **insert** (these columns only). **Nobody** can read, change or delete through the API. If the visitor is signed in, their user id is attached automatically. |
| `newsletter_subscribers` | **Closed to the API.** The footer form calls a function, `subscribe_to_newsletter()`, which only inserts and silently ignores duplicates so nobody can probe who is subscribed. |

**Check it worked**

1. **Table Editor**: you should see the three tables, each with an "RLS enabled" badge.
2. **Database → Advisors → Security Advisor**: run it and read every warning. It is a free second opinion on exactly this kind of setup.
3. Run the access checks in section 5, part D.

**Users who already exist** when you run the migration get an empty profile row (it backfills). Nothing else is needed.

**Reading submissions:** open **Table Editor → `contact_requests`** (or `newsletter_subscribers`). The dashboard acts as an administrator, so it can see rows the public key cannot. There is no admin page in the website; if you need your team to work leads from a screen, that is a separate project.

---

## 5. Configure authentication, redirects and test everything

### A. Settings in the dashboard (Authentication section)

1. **URL Configuration**
   - **Site URL:** your production address, for example `https://allyouneed.example` (use your real domain).
   - **Redirect URLs:** add every address an email link may return to. This site always returns to `/auth/callback/` (with the trailing slash):
     - `http://localhost:3000/auth/callback/` (local development)
     - `https://<your-domain>/auth/callback/` (production)
     - For preview deployments, a wildcard such as `https://*-<your-team>.vercel.app/**` (Vercel) or your host's equivalent.
   - If you skip this, sign-up and reset emails will send visitors to the wrong page or be refused.
2. **Sign In / Providers → Email**
   - Email provider: **enabled**.
   - **Confirm email: ON** (recommended). The site then tells new users to check their inbox. If you turn it off, new users are signed in immediately and sent to `/account/`; the site handles both.
   - **Minimum password length:** set **8** (the website already requires 8; this makes the server agree).
   - If your plan offers it, turn on **leaked-password protection**.
3. **Email templates** (Confirm signup, Reset password): keep the default `{{ .ConfirmationURL }}` link. You may reword the text. Do not remove the link, and do **not** switch to the `token_hash` / `/auth/confirm` templates from Supabase's server-side guides: this site has no such page.
   - Some company mail systems (for example Outlook Safe Links) open links to scan them, which can use up the one-time link so the visitor sees "expired". Test with a real Microsoft 365 / Outlook inbox before launch.
4. **SMTP (required before real launch):** Supabase's built-in email sender only delivers to members of your own Supabase team and is heavily rate-limited (a few emails an hour). Until you connect your own, real visitors' sign-ups and password resets **will fail** (the visitor sees a generic error). Under *Project Settings → Authentication → SMTP* connect a real provider (for example Resend, Amazon SES or Postmark) with a verified domain.
5. **Leave CAPTCHA OFF** (*Authentication → Attack Protection*) for now. The site does not send a captcha token, so turning it on would break sign-up, log in and password reset. Adding it is future work (section 8).

**If a reset or confirmation link lands on the wrong page** (for example the home page with `?code=…`), the address it returned to is not in the Redirect URLs list; Supabase fell back to the Site URL. Add the exact `/auth/callback/` URL for that origin (including `www` versus the bare domain). Always test the live domain, not only localhost.

**Email links and browsers:** the site uses the PKCE flow, so the link in a confirmation or reset email must be opened **in the same browser** that requested it. If it is opened elsewhere, the callback page explains this and points to Log in / Reset password (the email may already be confirmed).

### B. Test checklist: log in, log out, protected pages

Do this locally first (with `.env.local`), then again on the live site.

- [ ] **Protected page, signed out:** open `/account/`. You are sent to `/login/?next=%2Faccount%2F`; no account details flash up.
- [ ] **Sign up:** at `/register/` create an account with a real mailbox. You see "Check your email to confirm your account". In **Authentication → Users** the user appears as unconfirmed. In **Table Editor → profiles** a row exists with the name, company and phone you entered.
- [ ] **Confirm:** open the email link in the same browser. You land on `/account/`, signed in, with your details filled in.
- [ ] **Log out:** use **Log out** in the header (or on the account page). The header shows "Log in / Start free" again, you land on the home page, and `/account/` sends you to log in.
- [ ] **Log in:** at `/login/`, a wrong password shows "That email and password don't match"; the right one lands on `/account/` (or the page you were trying to reach).
- [ ] **Session persists:** reload, and close and reopen the tab, while signed in. You stay signed in.
- [ ] **Open-redirect guard:** open `/login/?next=//example.org`, log in. You end on `/account/`, not on another site.
- [ ] **Change password while signed in:** `/account/` → *Change password*. It asks for your **current** password first (a wrong one is refused and nothing changes), then the new one twice. (Someone arriving from a reset email is not asked: they don't have a current password.)
- [ ] **Password reset:** `/forgot-password/` → enter your email → the page says "Check your email" (it says the same for unknown addresses). The email link opens `/reset-password/`. Choose a new password; log out and log in with it. Re-using the old password is refused.
- [ ] **Unconfirmed login:** try logging in before confirming. You are told to confirm your email.

### C. Test checklist: database operations

- [ ] **Edit profile:** on `/account/` change your company and phone, save. "Details saved". Reload: the new values load. In **Table Editor → profiles** the row changed and `updated_at` moved.
- [ ] **Bad phone:** enter `12345`. The form rejects it before saving.
- [ ] **Contact form:** submit `/contact/`. You see the thank-you message. In **Table Editor → contact_requests** a row exists with `status = new`. If you were signed in, `user_id` is filled; if not, it is empty.
- [ ] **Contact form validation:** submit it empty. Every required field shows an error and nothing is stored.
- [ ] **Newsletter:** subscribe in the footer. "You're on the list". A row appears in `newsletter_subscribers` (lower-cased email). Subscribe with the same email again: still "You're on the list", still one row.

### D. Test checklist: access policies (this is the important one)

Replace `<URL>` and `<KEY>` with your project URL and **publishable** key. These simulate an anonymous visitor using the public key. They send only the `apikey` header (a new-style publishable key is not a JWT, so it is not sent as a bearer token).

```bash
# Should FAIL ("permission denied for table …"), not return rows:
curl "<URL>/rest/v1/contact_requests?select=*"        -H "apikey: <KEY>"
curl "<URL>/rest/v1/newsletter_subscribers?select=*"  -H "apikey: <KEY>"
curl "<URL>/rest/v1/profiles?select=*"                -H "apikey: <KEY>"

# Should SUCCEED (HTTP 201), and the row should appear in the dashboard:
curl -X POST "<URL>/rest/v1/contact_requests" -H "apikey: <KEY>" -H "Content-Type: application/json" \
  -d '{"name":"Policy test","email":"policy@example.test","phone":"9876543210","company":"Test","team_size":"1-10","modules":["hr"]}'

# Should FAIL (the client may not choose status):
curl -X POST "<URL>/rest/v1/contact_requests" -H "apikey: <KEY>" -H "Content-Type: application/json" \
  -d '{"name":"x","email":"a@b.co","phone":"9876543210","company":"c","team_size":"1-10","modules":["hr"],"status":"closed"}'
```

- [ ] The three reads fail; the first insert works; the `status` insert is refused.
- [ ] Sign in as user A and, in the browser console on the live site, confirm user A can read only their own profile row (not user B's). The Table Editor can show you both exist.
- [ ] Delete the test rows you created. In the SQL Editor:
  ```sql
  delete from public.contact_requests      where email like 'e2e-test+%@example.com';
  delete from public.newsletter_subscribers where email like 'e2e-test+%@example.com';
  ```

If **any** read in the first group returns rows, stop and fix it before launch: re-run the migration and re-check that **RLS enabled** shows on each table.

---

## 6. Replace the placeholder content

Everything below is clearly labelled on the pages until you replace it. I did not invent any of it.

| What | File | What to do |
|---|---|---|
| Statistics (organisations, employees, uptime) | `content/stats.ts` → `stats` | Set `value` to the real number (e.g. `{ value: 240, suffix: "+", label: "Organisations" }`). Leave `value: null` for any you cannot stand behind; it keeps showing `XX`. The "Figures marked XX are placeholders" note disappears on its own when none are left. |
| The line above the logos | `content/stats.ts` → `trustHeadline` | Replace the wording, e.g. `Trusted by growing Indian businesses`. |
| Customer logos / names | `content/stats.ts` → `trustLogos` | Replace the eight generic "Customer name N" labels with real customers' names **that have agreed to be named**. (They render as text with a building icon; real logo images would be a small design change.) |
| Testimonials | `content/testimonials.ts` | Replace the three placeholder entries with real, permissioned quotes (`quote`, `name`, `role`, `company`, `initials`). |
| Contact details | `content/site.ts` | Set `email`, `phone`, `address` to real values, then set **`contactIsPlaceholder: false`** so the "Placeholder" tags disappear. `phoneHref` follows `phone` automatically. Office hours are already `9:00 AM to 8:00 PM IST`. |
| Company name, domain, social links | `content/site.ts` → `legalName`, `url`, `social` | Real legal name, the real domain (it feeds the sitemap, robots and Open Graph links), real profiles. |
| Chartered-accountant network | `content/experts.ts` | The heading is now "A network of chartered accountants" with no count. Add a real number only if you have one. |
| Founding story | `content/about.ts` → `story` | Replace the two paragraphs that begin "Placeholder:". |
| Security statements | `content/about.ts` → `security`, and the card in `components/sections/Integrations.tsx` | Make each statement true of your real set-up (hosting region, encryption, backups, uptime commitments) before launch. |
| Prices and plan features | `content/pricing.ts` | **Not changed by me and still invented.** Replace with your real pricing. |
| Legal pages | `content/legal/*.ts` | Still **sample text** with invented company and contact details. Have a lawyer replace them. They must also describe Supabase as a data processor, the data collected, and where it is stored. |
| FAQ, feature copy, "Free for up to 5 users" style claims | `content/faq.ts`, `content/modules.ts`, `components/sections/*` | Product claims written before any product existed; confirm each one. |

**Tests that will (deliberately) fail once you replace placeholders:** `tests/content/placeholders.test.tsx` and parts of `tests/content/truthfulness.test.tsx` and `tests/content/integrity.test.ts` assert that the placeholders are still placeholders. When you put in real content, update or delete those assertions; they exist to stop anyone adding invented facts by accident, not to stop you adding real ones.

---

## 7. Deploying

Dependencies: Node 24 (LTS) and `npm install`. Runtime libraries added for this work: `@supabase/supabase-js`. Development only: `@electric-sql/pglite` (for the database tests).

1. **Before building:** do sections 2 to 4 (project, variables, migration).
2. **Build:** `npm run build`. It writes plain files to `out/`. (The `NEXT_PUBLIC_*` variables must be set in the environment of this command.)
3. **Host the `out/` folder** on any static host (Vercel, Netlify, Cloudflare Pages, S3 + CDN). For Vercel/Netlify/Cloudflare, connect the git repository, set the build command to `npm run build`, the output directory to `out`, and add the two variables to the build environment.
4. **Trailing slashes:** the site uses URLs like `/account/`. Most hosts handle this; if yours returns a 404 for `/account` or `/auth/callback`, enable its "trailing slash" or "clean URLs" setting.
5. **Back in Supabase:** set the **Site URL** and **Redirect URLs** to the live domain (section 5A) and connect real SMTP.
6. **Run the whole of section 5** against the live site.
7. **Security headers** (optional but wise) cannot be set by the site itself in a static export; configure them at the host: a Content-Security-Policy that allows connections to your `https://<ref>.supabase.co` origin, plus `X-Content-Type-Options` and `Referrer-Policy`.

---

## 8. What is not built yet (please read)

- **Newsletter consent.** The footer form adds any address typed into it, with no confirmation email (no double opt-in) and no record of when or where consent was given. Someone can subscribe a third party. Before you send any newsletter, decide on a consent model: either build double opt-in (store `confirmed_at`, email a confirmation link, only mail confirmed addresses) or collect addresses only for transactional purposes. This matters for India's DPDP Act and for your sender reputation.

- **Spam and rate limiting on the contact and newsletter forms.** The database only validates the shape of what arrives. Someone can still flood the tables with valid-looking rows using the public key. Mitigations, in order of effort: watch the tables and delete spam; add Cloudflare Turnstile and move the insert behind a Supabase Edge Function that checks the token; add a honeypot field. This needs a decision from you.
- **CAPTCHA on sign-up / log in / reset** (Supabase supports it; the site does not yet send a token).
- **Account deletion, changing your email address, two-factor login, social login (Google), team/organisation accounts.** Deleting an account needs a privileged key, so it must run on a server or Edge Function, never in the browser.
- **A staff screen** for reading and working leads (use the Supabase dashboard for now).
- **Generated database types:** `lib/supabase/database.types.ts` is hand-written to match the migration. Once your project exists, `npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts` will replace it.
- **`supabase/config.toml`** has never been run with the Supabase CLI.
- **The product itself.** Log in currently leads to an account page with a profile, not to the business modules the site describes; those are a separate project.

## 9. Assumptions about real Supabase that nobody has verified yet

Check each once after you have a project. They are the places where the stand-ins could differ from the real thing.

1. **The sign-up trigger fires.** Sign up one test user, then confirm a row appears in `public.profiles`. If it does not, look in *Logs → Auth* for "Database error saving new user".
2. **Data API privileges.** The migration assumes `anon` and `authenticated` can use the `public` schema and `auth.uid()` (the contact form's `user_id` default needs it). It gives `service_role` explicit access to the tables, but check *Table Editor* works for you as expected, and run *Database → Advisors → Security*.
3. **Over HTTP:** an anonymous `insert` into `contact_requests` (no read access) returns 201; `rpc/subscribe_to_newsletter` is callable by anonymous visitors; a signed-in profile update returns the row. The curl checks in section 5D cover the first; the browser checklist covers the rest.
4. **Keys.** New projects have `sb_publishable_…` / `sb_secret_…`; the legacy anon path assumes legacy keys are still enabled on older projects.
5. **Email delivery and templates:** see section 5A.
6. **`localStorage` sessions.** There are no cookies on a static host, so any cross-site-scripting bug would expose the session. Set a strict Content-Security-Policy at the hosting layer (section 7).
7. **supabase-js is pinned to 2.118.x** because the sign-in state depends on the order in which that library fires its events (`PASSWORD_RECOVERY` before `INITIAL_SESSION`). Upgrade deliberately and re-run the browser checklist.

## 10. Marketing claims still on the pages (your call)

You asked me not to invent customers, testimonials or performance statistics, and those are now placeholders. Other product claims were written before any product existed and are still there. They are not statistics about customers, so I left them, but you should confirm or remove each one: "Free for up to 5 users", "GST-ready in a day", "Save 20%", "Filed in 4 minutes" and "takes four minutes" in the employee-tax section, the plan prices and features, the feature copy, and the legal entity name and jurisdiction in the legal pages.

## 11. Files added or changed, for orientation

- `supabase/migrations/…_init_profiles_and_forms.sql` – schema, constraints, RLS, trigger, function.
- `lib/supabase/` – configuration (with the privileged-key guard), the browser client, form transport, table types.
- `lib/auth/` – the shared sign-in state, friendly error messages, the safe-redirect check, callback URL parsing.
- `components/auth/`, `components/account/`, `components/forms/*PasswordForm.tsx` – the session gate, callback page, account page, reset forms.
- `app/account`, `app/auth/callback`, `app/forgot-password`, `app/reset-password` – the new pages (all `noindex`).
- `tests/db/` (database), `tests/security/` (secrets), `tests/helpers/fakeSupabase.ts` and the auth/form/account tests.
- `.env.example` – the template for your two variables.
- `AGENTS.md` and `CLAUDE.md` (untracked): `next dev` writes these itself. They are not part of this work; commit or delete them as you prefer.
