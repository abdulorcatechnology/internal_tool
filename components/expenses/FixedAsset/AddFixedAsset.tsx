"use client";

import { useState, useEffect } from "react";
import { useCreateFixedAsset, useUpdateFixedAsset } from "@/lib/api/expenses";
import { useEmployees } from "@/lib/api/employees";
import type {
  FixedAssetWithEmployee,
  CreateFixedAssetInput,
  AssetType,
  AssetStatus,
} from "@/types/expenses";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import expensesOptions from "@/lib/options/expenses";

// ----- Fixed asset form -----
export default function FixedAssetForm({
  asset,
  onSuccess,
  onCancel,
}: {
  asset: FixedAssetWithEmployee | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateFixedAssetInput>({
    asset_name: asset?.asset_name ?? "",
    asset_type: asset?.asset_type ?? "laptop",
    purchase_date:
      asset?.purchase_date ?? new Date().toISOString().slice(0, 10),
    cost: asset?.cost ?? 0,
    assigned_employee_id: asset?.assigned_employee_id ?? null,
    depreciation_rate: asset?.depreciation_rate ?? null,
    status: asset?.status ?? "active",
  });

  useEffect(() => {
    if (asset) {
      setForm({
        asset_name: asset.asset_name,
        asset_type: asset.asset_type,
        purchase_date: asset.purchase_date,
        cost: asset.cost,
        assigned_employee_id: asset.assigned_employee_id ?? null,
        depreciation_rate: asset.depreciation_rate ?? null,
        status: asset.status,
      });
    } else {
      setForm({
        asset_name: "",
        asset_type: "laptop",
        purchase_date: new Date().toISOString().slice(0, 10),
        cost: 0,
        assigned_employee_id: null,
        depreciation_rate: null,
        status: "active",
      });
    }
  }, [asset]);

  const createM = useCreateFixedAsset();
  const updateM = useUpdateFixedAsset();
  const isEdit = !!asset;
  const mutation = isEdit ? updateM : createM;
  const { data: employees = [] } = useEmployees({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateM.mutateAsync({ id: asset.id, input: form });
      } else {
        await createM.mutateAsync(form);
      }
      onSuccess();
    } catch (_) {}
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit asset" : "Add fixed asset"}</SheetTitle>
        <SheetDescription>Laptop, Server, Phone, Furniture.</SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-4">
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
        <div className="grid gap-2">
          <Label>Asset name *</Label>
          <Input
            value={form.asset_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, asset_name: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Type *</Label>
          <Select
            value={form.asset_type}
            onValueChange={(v: AssetType) =>
              setForm((p) => ({ ...p, asset_type: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expensesOptions.ASSET_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Purchase date *</Label>
          <Input
            type="date"
            value={form.purchase_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, purchase_date: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Cost *</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.cost || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, cost: Number(e.target.value) || 0 }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Assigned employee</Label>
          <Select
            value={form.assigned_employee_id ?? "none"}
            onValueChange={(v) =>
              setForm((p) => ({
                ...p,
                assigned_employee_id: v === "none" ? null : v,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Depreciation rate (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={form.depreciation_rate ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                depreciation_rate: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v: AssetStatus) =>
              setForm((p) => ({ ...p, status: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expensesOptions.ASSET_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <SheetFooter className="flex-row gap-2 border-t p-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : isEdit ? "Update" : "Add asset"}
        </Button>
      </SheetFooter>
    </form>
  );
}
