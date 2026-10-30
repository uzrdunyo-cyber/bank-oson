-- Bank Oson AI — Supabase Database Migration
-- Tables: profiles, source_links, feedback, ai_usage_logs
-- Includes Row Level Security (RLS), triggers, and initial trusted sources.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique,
  full_name text,
  business_type text,
  preferred_language text default 'uz',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid()::text = user_id or user_id is null);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid()::text = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid()::text = user_id or user_id is null);

-- 2. SOURCE_LINKS TABLE (Official sources)
create table if not exists public.source_links (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  short_description text not null,
  url text not null,
  category text not null,
  verified boolean default true,
  last_verified_at date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.source_links enable row level security;

create policy "Source links are viewable by everyone"
  on public.source_links for select
  using (true);

-- 3. FEEDBACK TABLE
create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  category text not null,
  message text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

create policy "Feedback is readable by authenticated owners or admin"
  on public.feedback for select
  using (auth.uid()::text = user_id or user_id is null);

-- 4. AI_USAGE_LOGS TABLE (Non-sensitive telemetry only)
create table if not exists public.ai_usage_logs (
  id uuid primary key default uuid_generate_v4(),
  feature_name text not null,
  language text not null default 'uz',
  tokens_estimate integer default 0,
  is_demo_mode boolean default false,
  status text default 'success',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_usage_logs enable row level security;

create policy "Usage logs can be inserted anonymously"
  on public.ai_usage_logs for insert
  with check (true);

-- INITIAL SEED FOR OFFICIAL SOURCES
insert into public.source_links (name, short_description, url, category, verified, last_verified_at)
values
  ('O‘zbekiston Respublikasi Markaziy banki', 'Barcha banklarning bosh regulyatori, pul-kredit siyosati, valyuta kurslari va rasmiy hisobotlar.', 'https://cbu.uz/', 'Regulyator', true, '2026-10-27'),
  ('Markaziy Bank: Bank xizmatlari iste’molchilarining huquqlarini himoya qilish', 'Kredit shartnomalari, murojaat qilish tartibi, noqonuniy komissiyalardan himoyalanish va ishonch telefoni: 1114.', 'https://cbu.uz/oz/consumer-protection/', 'Iste’molchi huquqlari', true, '2026-10-27'),
  ('Lex.uz — O‘zbekiston Respublikasi Qonunchilik ma’lumotlari milliy bazasi', 'Banklar va bank faoliyati to‘g‘risida, Iste’mol krediti to‘g‘risida va Murojaatlar to‘g‘risidagi qonunlar.', 'https://lex.uz/', 'Qonunchilik', true, '2026-10-27'),
  ('O‘zbekiston Banklar Assotsiatsiyasi', 'Tijorat banklari faoliyatini muvofiqlashtirish, bank xizmatlari standartlari va yangiliklar.', 'https://uba.uz/', 'Bank tarmog‘i', true, '2026-10-27'),
  ('Xalqaro Valyuta Jamg‘armasi (IMF)', 'Global va O‘zbekiston iqtisodiyoti, makroiqtisodiy barqarorlik va moliya sektori sharhlari.', 'https://www.imf.org/', 'Xalqaro moliya', true, '2026-10-27'),
  ('Jahon banki (World Bank)', 'O‘zbekistonda moliyaviy inklyuzivlik, kichik biznesni qo‘llab-quvvatlash va rivojlanish loyihalari.', 'https://www.worldbank.org/', 'Xalqaro moliya', true, '2026-10-27'),
  ('Yagona interaktiv davlat xizmatlari portali (my.gov.uz)', 'Banklar va davlat organlariga rasmiy shikoyat hamda arizalarni yuborish davlat portali.', 'https://my.gov.uz/', 'Davlat xizmatlari', true, '2026-10-27');
