import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeesFilters,
} from "@/types/employees";
import { createSalaryRecord } from "@/lib/api/salary";

const QUERY_KEY = ["employees"] as const;

function supabase() {
  return createClient();
}

export async function fetchEmployees(
  filters?: EmployeesFilters,
): Promise<Employee[]> {
  let q = supabase()
    .from("employees")
    .select("*, departments(id, name)")
    .order("created_at", { ascending: false });

  if (filters?.department_id) {
    q = q.eq("department_id", filters.department_id);
  }
  if (filters?.status) {
    q = q.eq("status", filters.status);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase()
    .from("employees")
    .select("*, departments(id, name)")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Employee;
}

/** First day of month from YYYY-MM-DD (e.g. joining_date). */
function monthFromDate(ymd: string): string {
  return ymd.slice(0, 7) + "-01";
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const { data, error } = await supabase()
    .from("employees")
    .insert({
      full_name: input.full_name,
      employee_id: input.employee_id?.trim() || null,
      department_id: input.department_id ?? null,
      role: input.role ?? null,
      email: input.email,
      monthly_salary: Number(input.monthly_salary),
      joining_date: input.joining_date,
      payment_method_notes: input.payment_method_notes ?? null,
      status: input.status ?? "active",
      country: input.country ?? "",
      city: input.city ?? "",
      currency: input.currency ?? "",
      phone: input.phone ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  const employee = data as Employee;

  // Create one salary record for the joining month (pending, base = monthly_salary).
  try {
    await createSalaryRecord({
      employee_id: employee.id,
      month: monthFromDate(input.joining_date),
      base_salary: employee.monthly_salary,
      deductions: 0,
      bonus: 0,
      status: "pending",
    });
  } catch {
    // Employee is already created; salary record can be added manually from Salary page.
  }

  return employee;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.full_name !== undefined) payload.full_name = input.full_name;
  if (input.employee_id !== undefined)
    payload.employee_id = input.employee_id?.trim() || null;
  if (input.department_id !== undefined)
    payload.department_id = input.department_id;
  if (input.role !== undefined) payload.role = input.role;
  if (input.email !== undefined) payload.email = input.email;
  if (input.monthly_salary !== undefined)
    payload.monthly_salary = Number(input.monthly_salary);
  if (input.joining_date !== undefined)
    payload.joining_date = input.joining_date;
  if (input.payment_method_notes !== undefined)
    payload.payment_method_notes = input.payment_method_notes;
  if (input.status !== undefined) payload.status = input.status;
  if (input.country !== undefined) payload.country = input.country;
  if (input.city !== undefined) payload.city = input.city;
  if (input.currency !== undefined) payload.currency = input.currency;
  if (input.phone !== undefined) payload.phone = input.phone;

  const { data, error } = await supabase()
    .from("employees")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Employee;
}

/** Soft delete: set status to inactive */
export async function deactivateEmployee(id: string): Promise<Employee> {
  return updateEmployee(id, { status: "inactive" });
}

export async function activateEmployee(id: string): Promise<Employee> {
  return updateEmployee(id, { status: "active" });
}

export function useEmployees(filters?: EmployeesFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters] as const,
    queryFn: () => fetchEmployees(filters),
  });
}

export function useEmployee(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchEmployeeById(id) : Promise.resolve(null)),
    enabled: !!id,
    ...options,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["salary"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      updateEmployee(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeactivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useActivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activateEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
