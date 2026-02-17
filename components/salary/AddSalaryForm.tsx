"use client";

import { useState, useEffect } from "react";
import { useCreateSalaryRecord, useUpdateSalaryRecord } from "@/lib/api/salary";
import { useEmployees } from "@/lib/api/employees";
import type {
  SalaryRecordWithEmployee,
  CreateSalaryRecordInput,
  SalaryStatus,
} from "@/types/salary";
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
import monthHelper from "@/lib/helper/month";

const MONTH_OPTIONS = monthHelper.getMonthOptions();

export default function AddSalaryForm({
  record,
  onSuccess,
  onCancel,
}: {
  record: SalaryRecordWithEmployee | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const defaultMonth = new Date();
  const defaultYm = `${defaultMonth.getFullYear()}-${String(defaultMonth.getMonth() + 1).padStart(2, "0")}`;

  const [form, setForm] = useState<CreateSalaryRecordInput>({
    employee_id: record?.employee_id ?? "",
    month: record?.month?.slice(0, 7) ?? defaultYm,
    base_salary: record?.base_salary ?? 0,
    deductions: record?.deductions ?? 0,
    bonus: record?.bonus ?? 0,
    status: record?.status ?? "pending",
    payment_date: record?.payment_date ?? null,
    comments: record?.comments ?? null,
    receipt_url: record?.receipt_url ?? null,
  });

  useEffect(() => {
    setForm({
      employee_id: record?.employee_id ?? "",
      month: record?.month?.slice(0, 7) ?? defaultYm,
      base_salary: record?.base_salary ?? 0,
      deductions: record?.deductions ?? 0,
      bonus: record?.bonus ?? 0,
      status: record?.status ?? "pending",
      payment_date: record?.payment_date ?? null,
      comments: record?.comments ?? null,
      receipt_url: record?.receipt_url ?? null,
    });
  }, [record, defaultYm]);

  const createMutation = useCreateSalaryRecord();
  const updateMutation = useUpdateSalaryRecord();
  const isEdit = !!record;
  const mutation = isEdit ? updateMutation : createMutation;

  const { data: employees = [] } = useEmployees({ status: "active" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: record.id,
          input: {
            base_salary: form.base_salary,
            deductions: form.deductions,
            bonus: form.bonus,
            status: form.status,
            payment_date: form.payment_date || null,
            comments: form.comments || null,
            receipt_url: form.receipt_url || null,
          },
        });
      } else {
        await createMutation.mutateAsync(form);
      }
      onSuccess();
    } catch (_) {}
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-auto">
      <SheetHeader>
        <SheetTitle>
          {isEdit ? "Edit salary record" : "Add salary record"}
        </SheetTitle>
        <SheetDescription>
          One record per employee per month. Net = base + bonus − deductions.
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-4">
        {mutation.isError && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error?.message}
          </p>
        )}
        {!isEdit && (
          <div className="grid gap-2">
            <Label>Employee *</Label>
            <Select
              value={form.employee_id}
              onValueChange={(v) => setForm((p) => ({ ...p, employee_id: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}{" "}
                    {emp.employee_id ? `(${emp.employee_id})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {!isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="month">Month *</Label>
            <Select
              value={form.month}
              onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="base_salary">Base salary *</Label>
          <Input
            id="base_salary"
            type="number"
            min={0}
            step={0.01}
            value={form.base_salary || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                base_salary: Number(e.target.value) || 0,
              }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deductions">Deductions</Label>
          <Input
            id="deductions"
            type="number"
            min={0}
            step={0.01}
            value={form.deductions ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                deductions: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bonus">Bonus</Label>
          <Input
            id="bonus"
            type="number"
            min={0}
            step={0.01}
            value={form.bonus ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, bonus: Number(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v: SalaryStatus) =>
              setForm((p) => ({ ...p, status: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="payment_date">Payment date</Label>
          <Input
            id="payment_date"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.payment_date ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                payment_date: e.target.value || null,
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="comments">Comments</Label>
          <Input
            id="comments"
            value={form.comments ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, comments: e.target.value || null }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="receipt_url">Receipt URL</Label>
          <Input
            id="receipt_url"
            type="url"
            placeholder="https://..."
            value={form.receipt_url ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, receipt_url: e.target.value || null }))
            }
          />
        </div>
      </div>
      <SheetFooter className="flex-row gap-2 border-t p-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : isEdit ? "Update" : "Add record"}
        </Button>
      </SheetFooter>
    </form>
  );
}
