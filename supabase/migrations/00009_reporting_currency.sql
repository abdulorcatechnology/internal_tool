-- Allow dashboard (viewer/finance) to read reporting currency and exchange rates from app_settings.
-- Drop admin-only read and allow admin, finance, viewer to select.

drop policy if exists "Admin can read app_settings" on public.app_settings;

create policy "Admin, finance, viewer can read app_settings"
  on public.app_settings for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

comment on table public.app_settings is 'Key-value app config. reporting_currency_id and exchange_rates used for dashboard conversion.';
