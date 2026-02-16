"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil } from "lucide-react";
import { useSalaryRecords } from "@/lib/api/salary";
import { useEmployees } from "@/lib/api/employees";
import { useProfile } from "@/lib/api/profile";
import type { SalaryRecordWithEmployee, SalaryStatus } from "@/types/salary";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import AddSalaryForm from "@/components/salary/AddSalaryForm";
import SalaryTable from "@/components/salary/SalaryTable";
import SalaryAnalysis from "@/components/salary/SalaryAnalysis";
import Heading from "@/components/shared/Heading";

type SalaryTab = "records" | "analysis";

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState<SalaryTab>("records");
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
          <Heading
            title="Salary"
            description="Records and analysis of salary data."
          />
        </div>
        {canEdit && activeTab === "records" && (
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add record
          </Button>
        )}
      </div>

      <div
        role="tablist"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      >
        <button
          role="tab"
          aria-selected={activeTab === "records"}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeTab === "records"
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/50 hover:text-foreground",
          )}
          onClick={() => setActiveTab("records")}
        >
          Records
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "analysis"}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeTab === "analysis"
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/50 hover:text-foreground",
          )}
          onClick={() => setActiveTab("analysis")}
        >
          Analysis
        </button>
      </div>

      {activeTab === "records" && (
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
      )}

      {activeTab === "analysis" && <SalaryAnalysis />}

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
