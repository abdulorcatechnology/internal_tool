"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import {
  useSalaryRecords,
  useCreateSalaryRecord,
  useUpdateSalaryRecord,
} from "@/lib/api/salary";
import { useEmployees } from "@/lib/api/employees";
import { useProfile } from "@/lib/api/profile";
import type {
  SalaryRecordWithEmployee,
  CreateSalaryRecordInput,
  SalaryStatus,
} from "@/types/salary";
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

const STATUS_OPTIONS: { value: SalaryStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "deferred", label: "Deferred" },
];

function formatMonth(monthStr: string) {
  const d = new Date(monthStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatDate(d: string | null) {
  if (!d) return "—";
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

/** Last 24 months for filter dropdown */
function getMonthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ value: ym, label: formatMonth(ym) });
  }
  return out;
}

const MONTH_OPTIONS = getMonthOptions();

function SalaryForm({
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit salary record" : "Add salary record"}</SheetTitle>
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
                    {emp.full_name} ({emp.employee_id})
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
              setForm((p) => ({ ...p, base_salary: Number(e.target.value) || 0 }))
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
              setForm((p) => ({ ...p, deductions: Number(e.target.value) || 0 }))
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
            onValueChange={(v: SalaryStatus) => setForm((p) => ({ ...p, status: v }))}
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

export default function SalaryPage() {
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecordWithEmployee | null>(null);

  const filters = useMemo(() => {
    const f: { month?: string; employee_id?: string; status?: SalaryStatus } = {};
    if (monthFilter) f.month = monthFilter;
    if (employeeFilter !== "all") f.employee_id = employeeFilter;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [monthFilter, employeeFilter, statusFilter]);

  const { data: records = [], isLoading } = useSalaryRecords(filters);
  const { data: employees = [] } = useEmployees({ status: "active" });
  const { data: profile } = useProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "finance";

  function openAdd() {
    setEditingRecord(null);
    setSheetOpen(true);
  }

  function openEdit(rec: SalaryRecordWithEmployee) {
    setEditingRecord(rec);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Salary</h1>
          <p className="text-muted-foreground">
            Monthly salary records. One per employee per month; mark as Pending, Paid, or Deferred.
          </p>
        </div>
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add record
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary records</CardTitle>
          <CardDescription>Filter by month, employee, and status.</CardDescription>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Month
              </Label>
              <Select value={monthFilter || "all"} onValueChange={(v) => setMonthFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {MONTH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Employee
              </Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SalaryStatus | "all")}>
                <SelectTrigger className="w-[130px]">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
          ) : records.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No salary records found. Add one or adjust filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Ded.</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment date</TableHead>
                  <TableHead>Receipt</TableHead>
                  {canEdit && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">
                      {rec.employees?.full_name ?? "—"} ({rec.employees?.employee_id ?? "—"})
                    </TableCell>
                    <TableCell>{formatMonth(rec.month.slice(0, 7))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(rec.base_salary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(rec.deductions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(rec.bonus)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(rec.net_salary)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          rec.status === "paid" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                          rec.status === "pending" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                          rec.status === "deferred" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {rec.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(rec.payment_date)}</TableCell>
                    <TableCell>
                      {rec.receipt_url ? (
                        <a
                          href={rec.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(rec)}
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
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
          <SalaryForm
            record={editingRecord}
            onSuccess={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
