import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const QUERY_KEY = ["settings"] as const;
const DEPARTMENTS_KEY = "departments";

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
