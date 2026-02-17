-- Salary records: one per employee per month. Run after 00002_employees.sql.

create type salary_status as enum ('pending', 'paid', 'deferred');

create table public.salary_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete restrict,
  month date not null,
  base_salary numeric(12, 2) not null check (base_salary >= 0),
  deductions numeric(12, 2) default 0 check (deductions >= 0),
  bonus numeric(12, 2) default 0 check (bonus >= 0),
  net_salary numeric(12, 2) generated always as (base_salary + coalesce(bonus, 0) - coalesce(deductions, 0)) stored,
  status salary_status not null default 'pending',
  payment_date date,
  comments text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_records_employee_month_unique unique (employee_id, month)
);

create index salary_records_employee_id_idx on public.salary_records (employee_id);
create index salary_records_month_idx on public.salary_records (month desc);
create index salary_records_status_idx on public.salary_records (status);

alter table public.salary_records enable row level security;

-- Viewer: select only
create policy "Viewer can read salary_records"
  on public.salary_records for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

-- Finance & Admin: insert, update
create policy "Finance and Admin can insert salary_records"
  on public.salary_records for insert
  with check (public.get_my_role() in ('admin', 'finance'));

create policy "Finance and Admin can update salary_records"
  on public.salary_records for update
  using (public.get_my_role() in ('admin', 'finance'));

-- Admin only: delete (e.g. duplicate or draft correction)
create policy "Admin can delete salary_records"
  on public.salary_records for delete
  using (public.get_my_role() = 'admin');

comment on table public.salary_records is 'Monthly salary records; one per employee per month.';

-- Optional: Storage bucket for salary receipts (run if you want receipt uploads)
-- In Supabase Dashboard: Storage → New bucket → name "salary-receipts", Public if you want direct URLs.
-- Or uncomment below (Supabase may require enabling storage in project first):

-- insert into storage.buckets (id, name, public)
-- values ('salary-receipts', 'salary-receipts', true)
-- on conflict (id) do nothing;

-- allow authenticated users with admin/finance to upload and read
-- create policy "Finance and Admin can upload salary receipts"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'salary-receipts'
--     and public.get_my_role() in ('admin', 'finance')
--   );
-- create policy "Authenticated can read salary receipts"
--   on storage.objects for select
--   using (bucket_id = 'salary-receipts' and auth.role() = 'authenticated');
