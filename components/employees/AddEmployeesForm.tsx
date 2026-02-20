"use client";

import { useState, useEffect, useMemo } from "react";
import { useCreateEmployee, useUpdateEmployee } from "@/lib/api/employees";
import { useDepartments } from "@/lib/api/department";
import type {
  Employee,
  CreateEmployeeInput,
  EmployeeStatus,
} from "@/types/employees";
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
import { useCurrencies } from "@/lib/api/currency";

export default function AddEmployeesForm({
  employee,
  onSuccess,
  onCancel,
}: {
  employee: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { data: currencies = [] } = useCurrencies();

  const [form, setForm] = useState<CreateEmployeeInput>({
    full_name: employee?.full_name ?? "",
    employee_id: employee?.employee_id ?? "",
    department_id: employee?.department_id ?? null,
    role: employee?.role ?? "",
    email: employee?.email ?? "",
    monthly_salary: employee?.monthly_salary ?? 0,
    joining_date:
      employee?.joining_date ?? new Date().toISOString().slice(0, 10),
    payment_method_notes: employee?.payment_method_notes ?? "",
    status: employee?.status ?? "active",
    country: employee?.country ?? "",
    city: employee?.city ?? "",
    currency_id: employee?.currency_id ?? employee?.currencies?.id ?? null,
  });

  useEffect(() => {
    setForm({
      full_name: employee?.full_name ?? "",
      employee_id: employee?.employee_id ?? "",
      department_id: employee?.department_id ?? null,
      role: employee?.role ?? "",
      email: employee?.email ?? "",
      monthly_salary: employee?.monthly_salary ?? 0,
      joining_date:
        employee?.joining_date ?? new Date().toISOString().slice(0, 10),
      payment_method_notes: employee?.payment_method_notes ?? "",
      status: employee?.status ?? "active",
      country: employee?.country ?? "",
      city: employee?.city ?? "",
      currency_id: employee?.currency_id ?? employee?.currencies?.id ?? null,
    });
  }, [employee]);

  const { data: departments = [] } = useDepartments();
  const departmentOptions = useMemo(() => {
    const byId = new Map(departments.map((d) => [d.id, d]));
    if (
      employee?.department_id &&
      !byId.has(employee.department_id) &&
      employee.departments
    ) {
      return [
        { id: employee.department_id, name: employee.departments.name },
        ...departments,
      ];
    }
    return [...departments];
  }, [departments, employee?.department_id, employee?.departments]);

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isEdit = !!employee;
  const mutation = isEdit ? updateMutation : createMutation;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateEmployeeInput = {
      ...form,
      department_id:
        form.department_id && form.department_id !== "__none__"
          ? form.department_id
          : null,
      currency_id:
        form.currency_id && form.currency_id !== "__none__"
          ? form.currency_id
          : null,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: employee.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (_) {
      // Error is shown via mutation.error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-auto">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit employee" : "Add employee"}</SheetTitle>
        <SheetDescription>
          {isEdit
            ? "Update employee details."
            : "All fields with * are required."}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-4">
        {mutation.isError && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error?.message}
          </p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name *</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, full_name: e.target.value }))
            }
            required
          />
        </div>
        {/* <div className="grid gap-2">
          <Label htmlFor="employee_id">Employee ID (optional)</Label>
          <Input
            id="employee_id"
            value={form.employee_id ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, employee_id: e.target.value || null }))
            }
          />
        </div> */}
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, country: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={form.city ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={form.currency_id ?? "__none__"}
            onValueChange={(v) =>
              setForm((p) => ({
                ...p,
                currency_id: v === "__none__" ? null : v,
              }))
            }
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No currency</SelectItem>
              {currencies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="department">Department</Label>
          {departmentOptions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Add departments in Settings first.
            </p>
          ) : (
            <Select
              value={form.department_id ?? "__none__"}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  department_id: v === "__none__" ? null : v,
                }))
              }
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No department</SelectItem>
                {departmentOptions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={form.role ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, role: e.target.value || null }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthly_salary">Monthly salary *</Label>
          <Input
            id="monthly_salary"
            type="number"
            min={0}
            step={0.01}
            value={form.monthly_salary || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                monthly_salary: Number(e.target.value) || 0,
              }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="joining_date">Joining date *</Label>
          <Input
            id="joining_date"
            type="date"
            value={form.joining_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, joining_date: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="payment_method_notes">Payment method / notes</Label>
          <Input
            id="payment_method_notes"
            value={form.payment_method_notes ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                payment_method_notes: e.target.value || null,
              }))
            }
          />
        </div>
        {isEdit && (
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v: EmployeeStatus) =>
                setForm((p) => ({ ...p, status: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Working</SelectItem>
                <SelectItem value="inactive">Not working</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <SheetFooter className="flex-row gap-2 border-t p-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : isEdit ? "Update" : "Add employee"}
        </Button>
      </SheetFooter>
    </form>
  );
}
