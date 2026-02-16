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

import salaryOptions from "@/lib/options/salary";
import SalaryTable from "@/components/salary/SalaryTable";

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

      <SalaryTable
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        canEdit={canEdit}
        records={records}
        isLoading={isLoading}
        employees={employees}
        openEdit={openEdit}
        openAdd={openAdd}
      />

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
