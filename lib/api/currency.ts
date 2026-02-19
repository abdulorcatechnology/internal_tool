import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Currency,
  CreateCurrencyInput,
  UpdateCurrencyInput,
} from "@/types/currencies";

const QUERY_KEY = ["currencies"] as const;

function supabase() {
  return createClient();
}

export async function fetchCurrencies(): Promise<Currency[]> {
  const { data, error } = await supabase()
    .from("currencies")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Currency[];
}

export async function fetchCurrencyById(id: string): Promise<Currency | null> {
  const { data, error } = await supabase()
    .from("currencies")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Currency;
}

export async function createCurrency(
  input: CreateCurrencyInput,
): Promise<Currency> {
  const { data, error } = await supabase()
    .from("currencies")
    .insert({
      code: input.code.trim(),
      name: input.name?.trim(),
    })
    .select()
    .single();
  if (error) throw error;
  const currency = data as Currency;

  return currency;
}

export async function updateCurrency(
  id: string,
  input: UpdateCurrencyInput,
): Promise<Currency> {
  const payload: Record<string, unknown> = {};
  if (input.code !== undefined) payload.code = input.code.trim();
  if (input.name !== undefined) payload.name = input.name?.trim();

  const { data, error } = await supabase()
    .from("currencies")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Currency;
}

export async function deleteCurrency(id: string): Promise<void> {
  const { error } = await supabase().from("currencies").delete().eq("id", id);
  if (error) throw error;
}

export function useCurrencies() {
  return useQuery({
    queryKey: [...QUERY_KEY] as const,
    queryFn: fetchCurrencies,
  });
}

export function useCurrency(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchCurrencyById(id) : Promise.resolve(null)),
    enabled: !!id,
    ...options,
  });
}

export function useCreateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCurrency,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCurrencyInput }) =>
      updateCurrency(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCurrency,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
