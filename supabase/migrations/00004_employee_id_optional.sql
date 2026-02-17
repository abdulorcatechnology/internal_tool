-- Make employee_id optional (run after 00002_employees.sql).
-- Unique constraint kept: when provided, must be unique; multiple NULLs allowed.

alter table public.employees
  alter column employee_id drop not null;

comment on column public.employees.employee_id is 'Optional company-facing employee number; unique when set.';
