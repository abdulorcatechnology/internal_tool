-- Allow any asset type (e.g. Monitor, Vehicle) instead of enum only.
alter table public.fixed_assets
  alter column asset_type type text using asset_type::text;

drop type if exists public.asset_type;

comment on column public.fixed_assets.asset_type is 'Asset type: preset (laptop, server, phone, furniture) or custom text.';
