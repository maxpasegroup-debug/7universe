-- Full system: referrals, lead scoring, conversions, app settings, referrals log, storage bucket

-- App settings (singleton)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  step1_video_en text not null default 'jfKfPfyJRdk',
  step1_video_ml text not null default 'jfKfPfyJRdk',
  step1_video_ta text not null default 'jfKfPfyJRdk',
  step3_video_en text not null default '2vjPBrBU-TM',
  step3_video_ml text not null default '2vjPBrBU-TM',
  step3_video_ta text not null default '2vjPBrBU-TM',
  pdf_url text not null default 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  join_link text not null default 'https://example.com/join',
  content_overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Profile extensions
alter table public.onboarding_profiles
  add column if not exists referral_code text,
  add column if not exists referrer_id uuid references public.onboarding_profiles (id) on delete set null,
  add column if not exists lead_score int not null default 0,
  add column if not exists high_intent boolean not null default false,
  add column if not exists converted boolean not null default false,
  add column if not exists last_activity_at timestamptz not null default now(),
  add column if not exists whatsapp_welcome_sent_at timestamptz,
  add column if not exists whatsapp_reminder_sent_at timestamptz,
  add column if not exists whatsapp_expert_sent_at timestamptz;

create unique index if not exists onboarding_profiles_referral_code_key
  on public.onboarding_profiles (referral_code)
  where referral_code is not null;

create index if not exists onboarding_profiles_referrer_id_idx on public.onboarding_profiles (referrer_id);
create index if not exists onboarding_profiles_converted_idx on public.onboarding_profiles (converted);
create index if not exists onboarding_profiles_high_intent_idx on public.onboarding_profiles (high_intent);
create index if not exists onboarding_profiles_last_activity_idx on public.onboarding_profiles (last_activity_at);

-- Referral events (one row per successful referred signup)
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.onboarding_profiles (id) on delete cascade,
  referee_id uuid not null references public.onboarding_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referee_id)
);

create index if not exists referrals_referrer_id_idx on public.referrals (referrer_id);

alter table public.referrals enable row level security;

-- Storage bucket for CMS PDF uploads (create in Dashboard → Storage if this fails)
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;

comment on table public.app_settings is 'CMS: videos, PDF URL, join link, optional i18n JSON overrides';
comment on table public.referrals is 'Tracks referee signups attributed to a referrer';
