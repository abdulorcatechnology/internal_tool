-- Departments as source of truth. Replace employees.department text with FK.
-- Run after 00002_employees.sql.

-- 1) Create departments table
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint departments_name_unique unique (name)
);

create index departments_name_idx on public.departments (name);

alter table public.departments enable row level security;

create policy "Admin, finance, viewer can read departments"
  on public.departments for select
  using (public.get_my_role() in ('admin', 'finance', 'viewer'));

create policy "Admin can insert departments"
  on public.departments for insert
  with check (public.get_my_role() = 'admin');

create policy "Admin can update departments"
  on public.departments for update
  using (public.get_my_role() = 'admin');

create policy "Admin can delete departments"
  on public.departments for delete
  using (public.get_my_role() = 'admin');

comment on table public.departments is 'Departments; source of truth for employee department.';

-- 2) Seed departments from existing employee department values (distinct, non-empty)
insert into public.departments (name)
select distinct trim(employees.department)
from public.employees
where trim(employees.department) <> ''
on conflict (name) do nothing;

-- 3) Add department_id and backfill
alter table public.employees
  add column department_id uuid references public.departments (id) on delete set null;

update public.employees e
set department_id = d.id
from public.departments d
where d.name = trim(e.department);

create index employees_department_id_idx on public.employees (department_id);

-- 4) Drop old department column and its index
drop index if exists public.employees_department_idx;
alter table public.employees drop column department;

comment on column public.employees.department_id is 'References departments.id; source of truth for department.';
