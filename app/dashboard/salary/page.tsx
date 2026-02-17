"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useSalaryRecords } from "@/lib/api/salary";
import { useProfile } from "@/lib/api/profile";
import type { SalaryRecordWithEmployee, SalaryStatus } from "@/types/salary";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AddSalaryForm from "@/components/salary/AddSalaryForm";
import SalaryTable from "@/components/salary/SalaryTable";
import SalaryAnalysis from "@/components/salary/SalaryAnalysis";
import Heading from "@/components/shared/Heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SalaryTab = "records" | "analysis";

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState<SalaryTab>("records");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<SalaryRecordWithEmployee | null>(null);

  const filters = useMemo(() => {
    const f: { month?: string; status?: SalaryStatus } = {};
    if (monthFilter) f.month = monthFilter;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [monthFilter, statusFilter]);

  const { data: records = [], isLoading } = useSalaryRecords(filters);
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      r.employees?.full_name?.toLowerCase().includes(q),
    );
  }, [records, searchQuery]);
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SalaryTab)}
      >
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <SalaryTable
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            canEdit={canEdit}
            records={filteredRecords}
            isLoading={isLoading}
            openEdit={openEdit}
            openAdd={openAdd}
          />
        </TabsContent>
        <TabsContent value="analysis">
          <SalaryAnalysis />
        </TabsContent>
      </Tabs>

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
