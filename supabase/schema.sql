-- Mamama backend schema (Supabase / Postgres)
-- Apply with: supabase db push, or paste into the SQL editor.
-- The app works without any of this; these tables switch on accounts,
-- cross-device sync, coverage telemetry, and OTA safety-database updates.

-- ── User profiles ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  stage text check (stage in ('t1', 't2', 't3', 'bf')),
  due_date date,
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are self-readable"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles are self-writable"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles are self-updatable"
  on public.profiles for update using (auth.uid() = id);

-- ── Scan history sync ────────────────────────────────────────────────────────
create table if not exists public.scans (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  barcode text not null,
  product_name text,
  verdict text check (verdict in ('avoid', 'caution', 'ok', 'unknown')),
  stage text check (stage in ('t1', 't2', 't3', 'bf')),
  created_at timestamptz not null default now()
);

create index if not exists scans_user_idx on public.scans (user_id, created_at desc);

alter table public.scans enable row level security;

create policy "scans are self-readable"
  on public.scans for select using (auth.uid() = user_id);
create policy "scans are self-insertable"
  on public.scans for insert with check (auth.uid() = user_id);
create policy "scans are self-deletable"
  on public.scans for delete using (auth.uid() = user_id);

-- ── Coverage gaps: the demand signal that steers database growth ────────────
-- Anonymous by design: barcode + stage only, no user linkage.
create table if not exists public.coverage_gaps (
  id bigint generated always as identity primary key,
  barcode text not null,
  stage text,
  created_at timestamptz not null default now()
);

create index if not exists coverage_gaps_barcode_idx on public.coverage_gaps (barcode);

alter table public.coverage_gaps enable row level security;

create policy "anyone can report a gap"
  on public.coverage_gaps for insert to anon, authenticated with check (true);
-- no select policy: gap data is operator-only (read via service role / dashboard)

-- ── Safety database (server copy, for OTA updates in a later release) ───────
-- Mirrors the bundled JSON schema in src/data/safety/*.json.
create table if not exists public.safety_ingredients (
  id text primary key,
  name text not null,
  category text not null check (category in ('food', 'cosmetic')),
  aliases jsonb not null default '[]',
  risks jsonb not null,
  summary text not null,
  detail text not null,
  sources jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.safety_ingredients enable row level security;

create policy "safety database is public-readable"
  on public.safety_ingredients for select to anon, authenticated using (true);
-- writes: service role only (curation happens through the operator pipeline)

-- ── Reporting view: which uncovered barcodes are scanned most ────────────────
create or replace view public.coverage_demand as
select barcode, count(*) as scan_count, max(created_at) as last_seen
from public.coverage_gaps
group by barcode
order by scan_count desc;
