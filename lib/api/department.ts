import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Department, CreateDepartmentInput, UpdateDepartmentInput } from "@/types/departments";

const QUERY_KEY = ["departments"] as const;

function supabase() {
  return createClient();
}

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase()
    .from("departments")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function fetchDepartmentById(id: string): Promise<Department | null> {
  const { data, error } = await supabase()
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Department;
}

export async function createDepartment(
  input: CreateDepartmentInput
): Promise<Department> {
  const { data, error } = await supabase()
    .from("departments")
    .insert({
      name: input.name.trim(),
    })
    .select()
    .single();
  if (error) throw error;
  const department = data as Department;

  return department;
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput
): Promise<Department> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();

  const { data, error } = await supabase()
    .from("departments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Department;
}

export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await supabase().from("departments").delete().eq("id", id);
  if (error) throw error;
}

export function useDepartments() {
  return useQuery({
    queryKey: [...QUERY_KEY] as const,
    queryFn: fetchDepartments,
  });
}

export function useDepartment(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchDepartmentById(id) : Promise.resolve(null)),
    enabled: !!id,
    ...options,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) =>
      updateDepartment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
