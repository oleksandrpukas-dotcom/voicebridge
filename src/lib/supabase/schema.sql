-- Run this in Supabase SQL Editor to set up the database

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  tier text default 'free' check (tier in ('free', 'basic', 'premium')),
  minutes_remaining integer default 0,
  purchased_minutes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, tier, minutes_remaining)
  values (new.id, new.email, 'free', 0);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Usage logs
create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  session_start timestamptz not null,
  session_end timestamptz,
  seconds_used integer default 0,
  tier text not null,
  created_at timestamptz default now()
);

alter table public.usage_logs enable row level security;

create policy "Users can view own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.usage_logs for update
  using (auth.uid() = user_id);
