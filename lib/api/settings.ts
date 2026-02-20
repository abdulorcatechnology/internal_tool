import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const QUERY_KEY = ["settings"] as const;
const DEPARTMENTS_KEY = "departments";
const REPORTING_CURRENCY_KEY = "reporting_currency_id";
const EXCHANGE_RATES_KEY = "exchange_rates";

/** Exchange rates: 1 unit of currency_id = rate units of reporting currency. */
export type ExchangeRates = Record<string, number>;

function supabase() {
  return createClient();
}

/** Predefined departments (admin-managed in Settings). Returns [] if not set. */
export async function fetchPredefinedDepartments(): Promise<string[]> {
  const { data, error } = await supabase()
    .from("app_settings")
    .select("value")
    .eq("key", DEPARTMENTS_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value) as unknown;
    return Array.isArray(parsed)
      ? (parsed as string[]).filter((s) => typeof s === "string" && s.trim())
      : [];
  } catch {
    return [];
  }
}

export async function updatePredefinedDepartments(
  departments: string[],
): Promise<void> {
  const trimmed = departments.map((d) => d.trim()).filter(Boolean);
  const { error } = await supabase()
    .from("app_settings")
    .upsert(
      {
        key: DEPARTMENTS_KEY,
        value: JSON.stringify(trimmed),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  if (error) throw error;
}

export function usePredefinedDepartments() {
  return useQuery({
    queryKey: [...QUERY_KEY, DEPARTMENTS_KEY],
    queryFn: fetchPredefinedDepartments,
  });
}

export function useUpdatePredefinedDepartments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePredefinedDepartments,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, DEPARTMENTS_KEY] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Reporting currency for dashboard (all amounts converted to this). Null = no conversion. */
export async function fetchReportingCurrencyId(): Promise<string | null> {
  const { data, error } = await supabase()
    .from("app_settings")
    .select("value")
    .eq("key", REPORTING_CURRENCY_KEY)
    .maybeSingle();
  if (error) throw error;
  const v = data?.value?.trim();
  return v || null;
}

export async function updateReportingCurrencyId(
  currencyId: string | null,
): Promise<void> {
  const { error } = await supabase()
    .from("app_settings")
    .upsert(
      {
        key: REPORTING_CURRENCY_KEY,
        value: currencyId ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  if (error) throw error;
}

/** Rates: 1 unit of key (currency_id) = value units of reporting currency. */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const { data, error } = await supabase()
    .from("app_settings")
    .select("value")
    .eq("key", EXCHANGE_RATES_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data?.value) return {};
  try {
    const parsed = JSON.parse(data.value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: ExchangeRates = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && typeof v === "number" && v > 0) out[k] = v;
      }
      return out;
    }
  } catch {}
  return {};
}

export async function updateExchangeRates(
  rates: ExchangeRates,
): Promise<void> {
  const { error } = await supabase()
    .from("app_settings")
    .upsert(
      {
        key: EXCHANGE_RATES_KEY,
        value: JSON.stringify(rates),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  if (error) throw error;
}

export function useReportingCurrencyId() {
  return useQuery({
    queryKey: [...QUERY_KEY, REPORTING_CURRENCY_KEY],
    queryFn: fetchReportingCurrencyId,
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: [...QUERY_KEY, EXCHANGE_RATES_KEY],
    queryFn: fetchExchangeRates,
  });
}

export function useUpdateReportingCurrencyId() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateReportingCurrencyId,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, REPORTING_CURRENCY_KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateExchangeRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateExchangeRates,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, EXCHANGE_RATES_KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
