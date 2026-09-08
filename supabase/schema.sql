-- Global Kindness Map — Supabase schema
--
-- Run this in your Supabase project's SQL editor
-- (Project → SQL Editor → New query → paste → Run).

create extension if not exists "pgcrypto";

create table if not exists public.kindness_pins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  location_label text,
  category text not null default 'other' check (
    category in (
      'help_stranger',
      'donation',
      'environment',
      'animal',
      'emotional_support',
      'community',
      'other'
    )
  ),
  message text not null check (char_length(message) between 10 and 500),
  chain_parent_id uuid references public.kindness_pins(id) on delete set null,
  approved boolean not null default true
);

create index if not exists kindness_pins_approved_created_idx
  on public.kindness_pins (approved, created_at desc);

create index if not exists kindness_pins_location_idx
  on public.kindness_pins (latitude, longitude);

alter table public.kindness_pins enable row level security;

-- Anyone can read approved pins. There is intentionally NO insert/update/
-- delete policy for the anon role: all writes go through the app's
-- /api/pins server route, which validates + moderates content using the
-- Supabase service role key (which bypasses RLS). This keeps the public
-- API surface (this database) read-only from the outside.
drop policy if exists "Public read approved pins" on public.kindness_pins;
create policy "Public read approved pins"
  on public.kindness_pins for select
  using (approved = true);
