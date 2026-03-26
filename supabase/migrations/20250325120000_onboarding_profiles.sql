-- Run in Supabase SQL editor or via CLI: supabase db push

create table if not exists public.onboarding_profiles (
  id uuid primary key default gen_random_uuid(),
  mobile text not null unique,
  name text not null,
  language text not null default 'en',
  step1_completed boolean not null default false,
  step2_completed boolean not null default false,
  step3_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_profiles_mobile_idx on public.onboarding_profiles (mobile);

-- Block direct browser access with anon key; Next.js API uses service role (bypasses RLS).
alter table public.onboarding_profiles enable row level security;

comment on table public.onboarding_profiles is '7Universe onboarding users and step completion (accessed via server API with service role).';
