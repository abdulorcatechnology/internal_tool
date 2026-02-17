-- Employees table (single company, V1)
-- Run after 00001_profiles.sql

create type employee_status as enum ('active', 'inactive');

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  employee_id text not null,
  department text not null default '',
  role text,
  email text not null,
  monthly_salary numeric(12, 2) not null default 0 check (monthly_salary >= 0),
  joining_date date not null,
  payment_method_notes text,
  status employee_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_email_unique unique (email),
  constraint employees_employee_id_unique unique (employee_id)
);

create index employees_department_idx on public.employees (department);
create index employees_status_idx on public.employees (status);
create index employees_created_at_idx on public.employees (created_at desc);

alter table public.employees enable row level security;

-- Helper: current user's app role (for RLS)
create or replace function public.get_my_role()
returns app_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Viewer: select only
create policy "Viewer can read employees"
  on public.employees for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

-- Finance & Admin: insert, update (soft delete via status)
create policy "Finance and Admin can insert employees"
  on public.employees for insert
  with check (public.get_my_role() in ('admin', 'finance'));

create policy "Finance and Admin can update employees"
  on public.employees for update
  using (public.get_my_role() in ('admin', 'finance'));

-- Only Admin can delete (hard delete) – optional; prefer soft delete in app
create policy "Admin can delete employees"
  on public.employees for delete
  using (public.get_my_role() = 'admin');

comment on table public.employees is 'Employee records; soft delete by setting status to inactive';
