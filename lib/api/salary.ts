import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  SalaryRecord,
  SalaryRecordWithEmployee,
  CreateSalaryRecordInput,
  UpdateSalaryRecordInput,
  SalaryFilters,
} from "@/types/salary";

const QUERY_KEY = ["salary"] as const;

function supabase() {
  return createClient();
}

/** month YYYY-MM → first day of month for DB */
function monthToDate(ym: string): string {
  return `${ym}-01`;
}

export async function fetchSalaryRecords(
  filters?: SalaryFilters,
): Promise<SalaryRecordWithEmployee[]> {
  let q = supabase()
    .from("salary_records")
    .select("*, employees(full_name, employee_id, monthly_salary, currencies(id, code, name))")
    .order("month", { ascending: false });

  if (filters?.month) {
    const start = monthToDate(filters.month);
    q = q.gte("month", start).lt("month", nextMonth(start));
  }
  if (filters?.employee_id) {
    q = q.eq("employee_id", filters.employee_id);
  }
  if (filters?.status) {
    q = q.eq("status", filters.status);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as SalaryRecordWithEmployee[];
}

function nextMonth(ymd: string): string {
  const d = new Date(ymd);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export async function fetchSalaryRecordById(
  id: string,
): Promise<SalaryRecordWithEmployee | null> {
  const { data, error } = await supabase()
    .from("salary_records")
    .select("*, employees(full_name, employee_id, monthly_salary, currencies(id, code, name))")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as SalaryRecordWithEmployee;
}

export async function createSalaryRecord(
  input: CreateSalaryRecordInput,
): Promise<SalaryRecord> {
  const monthDate =
    input.month.length === 7 ? monthToDate(input.month) : input.month;
  const { data, error } = await supabase()
    .from("salary_records")
    .insert({
      employee_id: input.employee_id,
      month: monthDate,
      base_salary: Number(input.base_salary),
      deductions: Number(input.deductions ?? 0),
      bonus: Number(input.bonus ?? 0),
      status: input.status ?? "pending",
      payment_date: input.payment_date ?? null,
      comments: input.comments ?? null,
      receipt_url: input.receipt_url ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SalaryRecord;
}

export async function updateSalaryRecord(
  id: string,
  input: UpdateSalaryRecordInput,
): Promise<SalaryRecord> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.base_salary !== undefined)
    payload.base_salary = Number(input.base_salary);
  if (input.deductions !== undefined)
    payload.deductions = Number(input.deductions);
  if (input.bonus !== undefined) payload.bonus = Number(input.bonus);
  if (input.status !== undefined) payload.status = input.status;
  if (input.payment_date !== undefined)
    payload.payment_date = input.payment_date;
  if (input.comments !== undefined) payload.comments = input.comments;
  if (input.receipt_url !== undefined) payload.receipt_url = input.receipt_url;

  const { data, error } = await supabase()
    .from("salary_records")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SalaryRecord;
}

export async function uploadReceipt(
  recordId: string,
  file: File,
): Promise<string> {
  const sup = supabase();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${recordId}/${Date.now()}.${ext}`;
  const { error } = await sup.storage
    .from("salary-receipts")
    .upload(path, file, {
      upsert: true,
    });
  if (error) throw error;
  const { data } = sup.storage.from("salary-receipts").getPublicUrl(path);
  return data.publicUrl;
}

/** Fetch all salary records for a calendar year (for analysis) */
export async function fetchSalaryRecordsForYear(
  year?: number,
): Promise<SalaryRecordWithEmployee[]> {
  const y = year ?? new Date().getFullYear();
  const start = `${y}-01-01`;
  const end = `${y}-12-31`;
  const { data, error } = await supabase()
    .from("salary_records")
    .select("*, employees(full_name, employee_id, monthly_salary, currencies(id, code, name))")
    .gte("month", start)
    .lte("month", end)
    .order("month", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SalaryRecordWithEmployee[];
}

export function useSalaryRecordsForYear(year?: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, "year", year ?? new Date().getFullYear()] as const,
    queryFn: () => fetchSalaryRecordsForYear(year),
  });
}

export function useSalaryRecords(filters?: SalaryFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", filters] as const,
    queryFn: () => fetchSalaryRecords(filters),
  });
}

export function useSalaryRecord(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchSalaryRecordById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateSalaryRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSalaryRecord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateSalaryRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSalaryRecordInput;
    }) => updateSalaryRecord(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
