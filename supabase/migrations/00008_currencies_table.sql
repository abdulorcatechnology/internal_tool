-- Currencies as source of truth. Replace employees.currency text and add currency to expenses.
-- Run after 00007_departments_table.sql and 00005_expenses.sql.
-- Requires: employees.currency (text) exists; get_my_role() exists.

-- 1) Create currencies table (code unique; optional name for display)
create table public.currencies (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text,
  created_at timestamptz not null default now(),
  constraint currencies_code_unique unique (code)
);

create index currencies_code_idx on public.currencies (code);

alter table public.currencies enable row level security;

create policy "Admin, finance, viewer can read currencies"
  on public.currencies for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

create policy "Admin can insert currencies"
  on public.currencies for insert
  with check (public.get_my_role() = 'admin');

create policy "Admin can update currencies"
  on public.currencies for update
  using (public.get_my_role() = 'admin');

create policy "Admin can delete currencies"
  on public.currencies for delete
  using (public.get_my_role() = 'admin');

comment on table public.currencies is 'Currencies; used by employees and expenses.';

-- 2) Seed common currencies
insert into public.currencies (code, name) values
  ('PKR', 'Pakistani Rupee'),
  ('AED', 'UAE Dirham'),
  ('USD', 'US Dollar'),
  ('EUR', 'Euro'),
  ('GBP', 'British Pound'),
  ('INR', 'Indian Rupee')
on conflict (code) do nothing;

-- 3) Employees: add currency_id, backfill from employees.currency, drop currency
alter table public.employees
  add column currency_id uuid references public.currencies (id) on delete set null;

update public.employees e
set currency_id = c.id
from public.currencies c
where c.code = trim(e.currency);

create index employees_currency_id_idx on public.employees (currency_id);

alter table public.employees drop column if exists currency;

comment on column public.employees.currency_id is 'References currencies.id.';

-- 4) Fixed assets: add currency_id (required). Default existing rows to first currency.
alter table public.fixed_assets
  add column currency_id uuid references public.currencies (id) on delete restrict;

update public.fixed_assets
set currency_id = (select id from public.currencies order by code limit 1)
where currency_id is null;

alter table public.fixed_assets
  alter column currency_id set not null;

create index fixed_assets_currency_id_idx on public.fixed_assets (currency_id);

comment on column public.fixed_assets.currency_id is 'References currencies.id; required.';

-- 5) Day-to-day expenses: add currency_id (required). Default existing rows to first currency.
alter table public.day_to_day_expenses
  add column currency_id uuid references public.currencies (id) on delete restrict;

update public.day_to_day_expenses
set currency_id = (select id from public.currencies order by code limit 1)
where currency_id is null;

alter table public.day_to_day_expenses
  alter column currency_id set not null;

create index day_to_day_expenses_currency_id_idx on public.day_to_day_expenses (currency_id);

comment on column public.day_to_day_expenses.currency_id is 'References currencies.id; required.';
