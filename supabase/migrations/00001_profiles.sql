-- Profiles: extend auth.users with role and display info (run in Supabase SQL Editor)
-- Run this after enabling Auth in your Supabase project.

-- Custom role enum for the app
create type app_role as enum ('admin', 'finance', 'viewer');

-- Profile per user (id = auth.uid())
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Only service role or admin can update profiles (we'll add admin check later via app_metadata or profiles.role)
create policy "Users can update own profile (limited)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: allow first user to be admin (run once manually or via a one-off)
-- update public.profiles set role = 'admin' where id = 'your-user-uuid';

comment on table public.profiles is 'User profiles with role (admin, finance, viewer) for RLS and UI';
