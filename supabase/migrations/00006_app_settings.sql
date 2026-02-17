-- App settings (key-value). Used for predefined departments, HR contact, etc.
-- Run after 00001_profiles.sql (uses get_my_role).

create table public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "Admin can read app_settings"
  on public.app_settings for select
  using (public.get_my_role() = 'admin');

create policy "Admin can insert app_settings"
  on public.app_settings for insert
  with check (public.get_my_role() = 'admin');

create policy "Admin can update app_settings"
  on public.app_settings for update
  using (public.get_my_role() = 'admin');

comment on table public.app_settings is 'Key-value app config (e.g. departments JSON). Admin only.';
