"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, UserX } from "lucide-react";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeactivateEmployee,
} from "@/lib/api/employees";
import type {
  Employee,
  CreateEmployeeInput,
  EmployeeStatus,
} from "@/types/employees";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
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
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/api/profile";

const STATUS_OPTIONS: { value: EmployeeStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function EmployeeForm({
  employee,
  onSuccess,
  onCancel,
}: {
  employee: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateEmployeeInput>({
    full_name: employee?.full_name ?? "",
    employee_id: employee?.employee_id ?? "",
    department: employee?.department ?? "",
    role: employee?.role ?? "",
    email: employee?.email ?? "",
    monthly_salary: employee?.monthly_salary ?? 0,
    joining_date:
      employee?.joining_date ?? new Date().toISOString().slice(0, 10),
    payment_method_notes: employee?.payment_method_notes ?? "",
    status: employee?.status ?? "active",
  });

  useEffect(() => {
    setForm({
      full_name: employee?.full_name ?? "",
      employee_id: employee?.employee_id ?? "",
      department: employee?.department ?? "",
      role: employee?.role ?? "",
      email: employee?.email ?? "",
      monthly_salary: employee?.monthly_salary ?? 0,
      joining_date:
        employee?.joining_date ?? new Date().toISOString().slice(0, 10),
      payment_method_notes: employee?.payment_method_notes ?? "",
      status: employee?.status ?? "active",
    });
  }, [employee]);

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isEdit = !!employee;
  const mutation = isEdit ? updateMutation : createMutation;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: employee.id, input: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      onSuccess();
    } catch (_) {
      // Error is shown via mutation.error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="employee_id">Employee ID *</Label>
          <Input
            id="employee_id"
            value={form.employee_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, employee_id: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={form.department}
            onChange={(e) =>
              setForm((p) => ({ ...p, department: e.target.value }))
            }
          />
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">(
    "all",
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filters = useMemo(() => {
    const f: { status?: EmployeeStatus; department?: string } = {};
    if (statusFilter !== "all") f.status = statusFilter;
    if (departmentFilter !== "all") f.department = departmentFilter;
    return f;
  }, [statusFilter, departmentFilter]);

  const { data: employees = [], isLoading } = useEmployees(filters);
  const { data: profile } = useProfile();
  const deactivateMutation = useDeactivateEmployee();

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.department && set.add(e.department));
    return Array.from(set).sort();
  }, [employees]);

  const canEdit = profile?.role === "admin" || profile?.role === "finance";

  function openAdd() {
    setEditingEmployee(null);
    setSheetOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditingEmployee(emp);
    setSheetOpen(true);
  }

  async function handleDeactivate(emp: Employee) {
    if (
      !confirm(
        `Set ${emp.full_name} as Inactive? They will not receive new salary records.`,
      )
    )
      return;
    try {
      await deactivateMutation.mutateAsync(emp.id);
    } catch (_) {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage employees. Use Inactive to soft-delete.
          </p>
        </div>
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add employee
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee list</CardTitle>
          <CardDescription>Filter by status and department.</CardDescription>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as EmployeeStatus | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Department
              </Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : employees.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No employees found. Add one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead>Joining</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.full_name}
                    </TableCell>
                    <TableCell>{emp.employee_id}</TableCell>
                    <TableCell>{emp.department || "—"}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(emp.monthly_salary)}
                    </TableCell>
                    <TableCell>{formatDate(emp.joining_date)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          emp.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {emp.status}
                      </span>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(emp)}
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {emp.status === "active" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeactivate(emp)}
                              title="Set Inactive"
                              className="text-destructive hover:text-destructive"
                            >
                              <UserX className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
