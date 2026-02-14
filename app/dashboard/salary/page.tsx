"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { useSalaryRecords } from "@/lib/api/salary";
import { useEmployees } from "@/lib/api/employees";
import { useProfile } from "@/lib/api/profile";
import type { SalaryRecordWithEmployee, SalaryStatus } from "@/types/salary";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import monthHelper from "@/lib/helper/month";
import AddSalaryForm from "@/components/salary/AddSalaryForm";
import currencyHelper from "@/lib/helper/currency";
import dateHelper from "@/lib/helper/date";

const STATUS_OPTIONS: { value: SalaryStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "deferred", label: "Deferred" },
];

const MONTH_OPTIONS = monthHelper.getMonthOptions();
const formatMonth = monthHelper.formatMonth;
const formatCurrency = currencyHelper.formatCurrency;
const formatDate = dateHelper.formatDate;

export default function SalaryPage() {
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<SalaryRecordWithEmployee | null>(null);

  const filters = useMemo(() => {
    const f: { month?: string; employee_id?: string; status?: SalaryStatus } =
      {};
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
            Monthly salary records. One per employee per month; mark as Pending,
            Paid, or Deferred.
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
          <CardDescription>
            Filter by month, employee, and status.
          </CardDescription>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap text-sm">
                Month
              </Label>
              <Select
                value={monthFilter || "all"}
                onValueChange={(v) => setMonthFilter(v === "all" ? "" : v)}
              >
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
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as SalaryStatus | "all")
                }
              >
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
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
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
                  {canEdit && (
                    <TableHead className="w-[80px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">
                      {rec.employees?.full_name ?? "—"}
                      {rec.employees?.employee_id
                        ? ` (${rec.employees.employee_id})`
                        : ""}
                    </TableCell>
                    <TableCell>{formatMonth(rec.month.slice(0, 7))}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(rec.base_salary)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(rec.deductions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(rec.bonus)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(rec.net_salary)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          rec.status === "paid" &&
                            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                          rec.status === "pending" &&
                            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                          rec.status === "deferred" &&
                            "bg-muted text-muted-foreground",
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
          <AddSalaryForm
            record={editingRecord}
            onSuccess={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
