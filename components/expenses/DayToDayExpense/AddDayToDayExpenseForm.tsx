"use client";

import { useState, useEffect } from "react";
import {
  useCreateDayToDayExpense,
  useUpdateDayToDayExpense,
} from "@/lib/api/expenses";
import type {
  DayToDayExpense,
  CreateDayToDayExpenseInput,
  ExpenseCategory,
  ExpensePaymentStatus,
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

// ----- Day-to-day form -----
export default function DayToDayForm({
  expense,
  onSuccess,
  onCancel,
}: {
  expense: DayToDayExpense | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateDayToDayExpenseInput>({
    category: expense?.category ?? "other",
    vendor: expense?.vendor ?? "",
    date: expense?.date ?? new Date().toISOString().slice(0, 10),
    amount: expense?.amount ?? 0,
    payment_status: expense?.payment_status ?? "pending",
    receipt_url: expense?.receipt_url ?? null,
    notes: expense?.notes ?? null,
  });

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category,
        vendor: expense.vendor,
        date: expense.date,
        amount: expense.amount,
        payment_status: expense.payment_status,
        receipt_url: expense.receipt_url ?? null,
        notes: expense.notes ?? null,
      });
    } else {
      setForm({
        category: "other",
        vendor: "",
        date: new Date().toISOString().slice(0, 10),
        amount: 0,
        payment_status: "pending",
        receipt_url: null,
        notes: null,
      });
    }
  }, [expense]);

  const createM = useCreateDayToDayExpense();
  const updateM = useUpdateDayToDayExpense();
  const isEdit = !!expense;
  const mutation = isEdit ? updateM : createM;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateM.mutateAsync({ id: expense.id, input: form });
      } else {
        await createM.mutateAsync(form);
      }
      onSuccess();
    } catch (_) {}
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SheetHeader>
        <SheetTitle>
          {isEdit ? "Edit expense" : "Add day-to-day expense"}
        </SheetTitle>
        <SheetDescription>Utilities, Rent, Software, etc.</SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-4">
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
        <div className="grid gap-2">
          <Label>Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v: ExpenseCategory) =>
              setForm((p) => ({ ...p, category: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expensesOptions.CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Vendor *</Label>
          <Input
            value={form.vendor}
            onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Amount *</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.amount || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, amount: Number(e.target.value) || 0 }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Payment status</Label>
          <Select
            value={form.payment_status}
            onValueChange={(v: ExpensePaymentStatus) =>
              setForm((p) => ({ ...p, payment_status: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expensesOptions.PAYMENT_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Receipt URL</Label>
          <Input
            type="url"
            placeholder="https://..."
            value={form.receipt_url ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, receipt_url: e.target.value || null }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Notes</Label>
          <Input
            value={form.notes ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, notes: e.target.value || null }))
            }
          />
        </div>
      </div>
      <SheetFooter className="flex-row gap-2 border-t p-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : isEdit ? "Update" : "Add expense"}
        </Button>
      </SheetFooter>
    </form>
  );
}
