-- Office expenses: fixed assets and day-to-day. Run after 00002_employees.sql.

-- 8A. Fixed assets / systems
create type asset_type as enum ('laptop', 'server', 'phone', 'furniture');
create type asset_status as enum ('active', 'retired');

create table public.fixed_assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  asset_type asset_type not null,
  purchase_date date not null,
  cost numeric(12, 2) not null check (cost >= 0),
  assigned_employee_id uuid references public.employees (id) on delete set null,
  depreciation_rate numeric(5, 2) check (depreciation_rate is null or (depreciation_rate >= 0 and depreciation_rate <= 100)),
  status asset_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fixed_assets_asset_type_idx on public.fixed_assets (asset_type);
create index fixed_assets_status_idx on public.fixed_assets (status);
create index fixed_assets_purchase_date_idx on public.fixed_assets (purchase_date desc);

alter table public.fixed_assets enable row level security;

create policy "Viewer can read fixed_assets"
  on public.fixed_assets for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

create policy "Finance and Admin can insert fixed_assets"
  on public.fixed_assets for insert
  with check (public.get_my_role() in ('admin', 'finance'));

create policy "Finance and Admin can update fixed_assets"
  on public.fixed_assets for update
  using (public.get_my_role() in ('admin', 'finance'));

create policy "Admin can delete fixed_assets"
  on public.fixed_assets for delete
  using (public.get_my_role() = 'admin');

-- 8B. Day-to-day expenses
create type expense_category as enum (
  'utilities', 'internet', 'rent', 'software', 'travel', 'pantry', 'marketing', 'other'
);
create type expense_payment_status as enum ('pending', 'paid');

create table public.day_to_day_expenses (
  id uuid primary key default gen_random_uuid(),
  category expense_category not null,
  vendor text not null default '',
  date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_status expense_payment_status not null default 'pending',
  receipt_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index day_to_day_expenses_category_idx on public.day_to_day_expenses (category);
create index day_to_day_expenses_date_idx on public.day_to_day_expenses (date desc);
create index day_to_day_expenses_payment_status_idx on public.day_to_day_expenses (payment_status);

alter table public.day_to_day_expenses enable row level security;

create policy "Viewer can read day_to_day_expenses"
  on public.day_to_day_expenses for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

create policy "Finance and Admin can insert day_to_day_expenses"
  on public.day_to_day_expenses for insert
  with check (public.get_my_role() in ('admin', 'finance'));

create policy "Finance and Admin can update day_to_day_expenses"
  on public.day_to_day_expenses for update
  using (public.get_my_role() in ('admin', 'finance'));

create policy "Admin can delete day_to_day_expenses"
  on public.day_to_day_expenses for delete
  using (public.get_my_role() = 'admin');

comment on table public.fixed_assets is 'Office fixed assets (laptop, server, phone, furniture).';
comment on table public.day_to_day_expenses is 'Day-to-day office expenses by category.';
