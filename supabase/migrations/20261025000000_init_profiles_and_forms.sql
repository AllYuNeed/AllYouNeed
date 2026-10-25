-- Allyouneed: user profiles, contact (book-a-demo) requests and newsletter subscribers.
--
-- Security model
--   * Row Level Security is ON for every table; grants are explicit and as narrow as possible.
--   * The browser only ever holds the public (publishable/anon) key, so these policies ARE the access control.
--   * profiles             - a signed-in user can read and edit ONLY their own row; nobody can insert or delete rows
--                            from the API (rows are created by the trigger below and removed with the auth user).
--   * contact_requests     - anyone (anon or signed in) can INSERT; nobody can read, change or delete from the API.
--                            Read them in the Supabase dashboard (Table editor) or with the service role on a server.
--   * newsletter_subscribers - closed to the API; the footer form calls public.subscribe_to_newsletter(), which
--                            only inserts and never reveals whether an address was already subscribed.
--
-- Safe to re-run: every statement is idempotent. Apply with `supabase db push` or paste into the SQL editor.

-- ---------------------------------------------------------------------------------------------------------------
-- Shared helper: keep updated_at honest.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- profiles: one row per auth user, holding the details collected at sign-up.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '' check (char_length(full_name) <= 120),
  company     text        not null default '' check (char_length(company) <= 160),
  -- 10-digit Indian mobile, no country code (same rule as the website's forms); '' when not provided.
  phone       text        not null default '' check (phone = '' or phone ~ '^[6-9][0-9]{9}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert / delete policy on purpose. Column-level update grant: a user can change only these three fields,
-- never id, created_at or updated_at.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, company, phone) on table public.profiles to authenticated;
-- The dashboard and server-side code use service_role; do not rely on project defaults to grant it.
grant select, insert, update, delete on table public.profiles to service_role;

-- Create the profile when a user signs up. SECURITY DEFINER so it can write past RLS; search_path is pinned and
-- the metadata (which the client controls) is sanitised so a bad value can never make sign-up fail.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta      jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_phone text  := coalesce(meta ->> 'phone', '');
begin
  insert into public.profiles (id, full_name, company, phone)
  values (
    new.id,
    left(btrim(coalesce(meta ->> 'full_name', '')), 120),
    left(btrim(coalesce(meta ->> 'company', '')), 160),
    case when raw_phone ~ '^[6-9][0-9]{9}$' then raw_phone else '' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A trigger function must not be callable over the API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users that already exist when this migration runs get an (empty) profile.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------------------------------------------
-- contact_requests: the "Book a demo" form.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  -- Filled in automatically for signed-in visitors (the API cannot set it: see the column grant below).
  user_id     uuid        default auth.uid() references auth.users (id) on delete set null,
  name        text        not null check (char_length(btrim(name)) between 1 and 120),
  email       text        not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone       text        not null check (phone ~ '^[6-9][0-9]{9}$'),
  company     text        not null check (char_length(btrim(company)) between 1 and 160),
  -- Keep in step with `teamSizes` in lib/schemas.ts (a test enforces it).
  team_size   text        not null check (team_size in ('1-10', '11-50', '51-200', '201-500', '500+')),
  -- Module slugs from content/modules.ts, e.g. {hr,payroll,tax-filing}.
  modules     text[]      not null check (
                cardinality(modules) between 1 and 20
                and array_position(modules, null) is null
                and array_to_string(modules, ',') ~ '^[a-z0-9_-]+(,[a-z0-9_-]+)*$'
                and char_length(array_to_string(modules, ',')) <= 400
              ),
  message     text        not null default '' check (char_length(message) <= 2000),
  status      text        not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

drop policy if exists "contact_requests_insert" on public.contact_requests;
create policy "contact_requests_insert" on public.contact_requests
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

-- Insert-only, and only these columns (so status / user_id / id / created_at can never be chosen by the client).
revoke all on table public.contact_requests from anon, authenticated;
grant insert (name, email, phone, company, team_size, modules, message) on table public.contact_requests to anon, authenticated;
grant select, insert, update, delete on table public.contact_requests to service_role;

create index if not exists contact_requests_created_at_idx on public.contact_requests (created_at desc);

-- ---------------------------------------------------------------------------------------------------------------
-- newsletter_subscribers: the footer sign-up.
-- ---------------------------------------------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  -- The app lower-cases before sending; the constraint makes that a rule, so `unique` really means unique.
  email       text        not null unique check (
                char_length(email) between 3 and 254
                and email = lower(email)
                and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
              ),
  whatsapp    text        not null default '' check (whatsapp = '' or whatsapp ~ '^[6-9][0-9]{9}$'),
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- The table is closed to the API completely: no policy, no grant. The footer form calls the function below, which
-- also means "is this address already subscribed?" can never be probed (a duplicate is silently ignored).
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;

create or replace function public.subscribe_to_newsletter(p_email text, p_whatsapp text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.newsletter_subscribers (email, whatsapp)
  values (lower(btrim(coalesce(p_email, ''))), btrim(coalesce(p_whatsapp, '')))
  on conflict (email) do nothing;
end;
$$;

-- Callable by the browser roles only; it returns nothing and writes only rows that pass the table's constraints.
revoke all on function public.subscribe_to_newsletter(text, text) from public, anon, authenticated;
grant execute on function public.subscribe_to_newsletter(text, text) to anon, authenticated, service_role;
