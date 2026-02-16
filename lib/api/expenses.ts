import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  FixedAsset,
  FixedAssetWithEmployee,
  CreateFixedAssetInput,
  UpdateFixedAssetInput,
  FixedAssetFilters,
  DayToDayExpense,
  CreateDayToDayExpenseInput,
  UpdateDayToDayExpenseInput,
  DayToDayExpenseFilters,
} from "@/types/expenses";
import monthHelper from "@/lib/helper/month";

const FIXED_ASSETS_KEY = ["expenses", "fixed_assets"] as const;
const DAY_TO_DAY_KEY = ["expenses", "day_to_day"] as const;

function supabase() {
  return createClient();
}

// ---------- Fixed assets ----------

export async function fetchFixedAssets(
  filters?: FixedAssetFilters,
): Promise<FixedAssetWithEmployee[]> {
  let q = supabase()
    .from("fixed_assets")
    .select("*, employees(full_name, employee_id)")
    .order("purchase_date", { ascending: false });

  if (filters?.asset_type) q = q.eq("asset_type", filters.asset_type);
  if (filters?.status) q = q.eq("status", filters.status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FixedAssetWithEmployee[];
}

export async function createFixedAsset(
  input: CreateFixedAssetInput,
): Promise<FixedAsset> {
  const { data, error } = await supabase()
    .from("fixed_assets")
    .insert({
      asset_name: input.asset_name,
      asset_type: input.asset_type,
      purchase_date: input.purchase_date,
      cost: Number(input.cost),
      assigned_employee_id: input.assigned_employee_id ?? null,
      depreciation_rate: input.depreciation_rate ?? null,
      status: input.status ?? "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data as FixedAsset;
}

export async function updateFixedAsset(
  id: string,
  input: UpdateFixedAssetInput,
): Promise<FixedAsset> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.asset_name !== undefined) payload.asset_name = input.asset_name;
  if (input.asset_type !== undefined) payload.asset_type = input.asset_type;
  if (input.purchase_date !== undefined)
    payload.purchase_date = input.purchase_date;
  if (input.cost !== undefined) payload.cost = Number(input.cost);
  if (input.assigned_employee_id !== undefined)
    payload.assigned_employee_id = input.assigned_employee_id ?? null;
  if (input.depreciation_rate !== undefined)
    payload.depreciation_rate = input.depreciation_rate ?? null;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase()
    .from("fixed_assets")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as FixedAsset;
}

export async function deleteFixedAsset(id: string): Promise<void> {
  const { error } = await supabase().from("fixed_assets").delete().eq("id", id);
  if (error) throw error;
}

export function useFixedAssets(filters?: FixedAssetFilters) {
  return useQuery({
    queryKey: [...FIXED_ASSETS_KEY, filters] as const,
    queryFn: () => fetchFixedAssets(filters),
  });
}

export function useCreateFixedAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFixedAsset,
    onSuccess: () => qc.invalidateQueries({ queryKey: FIXED_ASSETS_KEY }),
  });
}

export function useUpdateFixedAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFixedAssetInput }) =>
      updateFixedAsset(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: FIXED_ASSETS_KEY }),
  });
}

export function useDeleteFixedAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFixedAsset,
    onSuccess: () => qc.invalidateQueries({ queryKey: FIXED_ASSETS_KEY }),
  });
}

// ---------- Day-to-day expenses ----------

export async function fetchDayToDayExpenses(
  filters?: DayToDayExpenseFilters,
): Promise<DayToDayExpense[]> {
  let q = supabase()
    .from("day_to_day_expenses")
    .select("*")
    .order("date", { ascending: false });

  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.payment_status)
    q = q.eq("payment_status", filters.payment_status);
  if (filters?.month) {
    const start = monthHelper.monthToDate(filters.month);
    q = q.gte("date", start).lt("date", monthHelper.nextMonth(start));
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DayToDayExpense[];
}

export async function createDayToDayExpense(
  input: CreateDayToDayExpenseInput,
): Promise<DayToDayExpense> {
  const { data, error } = await supabase()
    .from("day_to_day_expenses")
    .insert({
      category: input.category,
      vendor: input.vendor,
      date: input.date,
      amount: Number(input.amount),
      payment_status: input.payment_status ?? "pending",
      receipt_url: input.receipt_url ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DayToDayExpense;
}

export async function updateDayToDayExpense(
  id: string,
  input: UpdateDayToDayExpenseInput,
): Promise<DayToDayExpense> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.category !== undefined) payload.category = input.category;
  if (input.vendor !== undefined) payload.vendor = input.vendor;
  if (input.date !== undefined) payload.date = input.date;
  if (input.amount !== undefined) payload.amount = Number(input.amount);
  if (input.payment_status !== undefined)
    payload.payment_status = input.payment_status;
  if (input.receipt_url !== undefined)
    payload.receipt_url = input.receipt_url ?? null;
  if (input.notes !== undefined) payload.notes = input.notes ?? null;

  const { data, error } = await supabase()
    .from("day_to_day_expenses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DayToDayExpense;
}

export async function deleteDayToDayExpense(id: string): Promise<void> {
  const { error } = await supabase()
    .from("day_to_day_expenses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export function useDayToDayExpenses(filters?: DayToDayExpenseFilters) {
  return useQuery({
    queryKey: [...DAY_TO_DAY_KEY, filters] as const,
    queryFn: () => fetchDayToDayExpenses(filters),
  });
}

export function useCreateDayToDayExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDayToDayExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: DAY_TO_DAY_KEY }),
  });
}

export function useUpdateDayToDayExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateDayToDayExpenseInput;
    }) => updateDayToDayExpense(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: DAY_TO_DAY_KEY }),
  });
}

export function useDeleteDayToDayExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDayToDayExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: DAY_TO_DAY_KEY }),
  });
}
