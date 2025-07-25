-- Migration: Create profiles table with premium status and RLS
-- Date: 2024-06-10

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  is_premium boolean not null default false,
  gumroad_sale_id text,
  premium_until timestamptz
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Allow users to SELECT and UPDATE their own profile
-- Make policies idempotent

drop policy if exists "Users can select their own profile" on public.profiles;
create policy "Users can select their own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: Insert profile row after user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 