"use client";

import { Pencil, ExternalLink } from "lucide-react";
import type { SalaryRecordWithEmployee, SalaryStatus } from "@/types/salary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import monthHelper from "@/lib/helper/month";
import currencyHelper from "@/lib/helper/currency";
import salaryOptions from "@/lib/options/salary";
import SelectDropdown from "../shared/SelectDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTH_OPTIONS = monthHelper.getMonthOptions();
const formatMonth = monthHelper.formatMonth;
const formatCurrency = currencyHelper.formatCurrency;
const formatDate = monthHelper.formatDate;

interface SalaryTableProps {
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  statusFilter: SalaryStatus | "all";
  setStatusFilter: (value: SalaryStatus | "all") => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  canEdit: boolean;
  records: SalaryRecordWithEmployee[];
  isLoading: boolean;
  openEdit: (rec: SalaryRecordWithEmployee) => void;
  openAdd: () => void;
}

const SalaryTable = ({
  monthFilter,
  setMonthFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  canEdit,
  records,
  isLoading,
  openEdit,
}: SalaryTableProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Salary records</CardTitle>
          <CardDescription>
            Filter by month, employee, status, or search by name.
          </CardDescription>
          <div className="flex flex-wrap items-end gap-4 pt-2">
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-sm">Search</Label>
              <Input
                placeholder="Employee name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <SelectDropdown
              label="Month"
              options={[
                { value: "all", label: "All months" },
                ...MONTH_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                })),
              ]}
              value={monthFilter || "all"}
              onChange={(v) => setMonthFilter(v === "all" ? "" : v)}
            />
            <SelectDropdown
              label="Status"
              options={salaryOptions.STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) =>
                setStatusFilter(v === "all" ? "all" : (v as SalaryStatus))
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : (
            <DataTable<SalaryRecordWithEmployee>
              columns={[
                {
                  id: "employee",
                  header: "Employee",
                  className: "font-medium",
                  cell: (rec) =>
                    `${rec.employees?.full_name ?? "—"}${rec.employees?.employee_id ? ` (${rec.employees.employee_id})` : ""}`,
                },
                {
                  id: "month",
                  header: "Month",
                  cell: (rec) => formatMonth(rec.month.slice(0, 7)),
                },
                {
                  id: "base",
                  header: "Base",
                  align: "right",
                  cell: (rec) =>
                    `${rec.employees?.currency} ${rec.employees?.monthly_salary}`,
                },
                {
                  id: "ded",
                  header: "Ded.",
                  align: "right",
                  cell: (rec) => `${rec.employees?.currency} ${rec.deductions}`,
                },
                {
                  id: "bonus",
                  header: "Bonus",
                  align: "right",
                  cell: (rec) => `${rec.employees?.currency} ${rec.bonus}`,
                },
                {
                  id: "net",
                  header: "Net",
                  align: "right",
                  className: "font-medium",
                  cell: (rec) => `${rec.employees?.currency} ${rec.net_salary}`,
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (rec) => (
                    <StatusBadge
                      variant={
                        rec.status === "paid"
                          ? "success"
                          : rec.status === "pending"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {rec.status}
                    </StatusBadge>
                  ),
                },
                {
                  id: "payment_date",
                  header: "Payment date",
                  cell: (rec) => formatDate(rec.payment_date),
                },
                {
                  id: "receipt",
                  header: "Receipt",
                  cell: (rec) =>
                    rec.receipt_url ? (
                      <a
                        href={rec.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center gap-1 hover:underline"
                      >
                        View <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      "—"
                    ),
                },
              ]}
              data={records ?? []}
              getRowKey={(rec) => rec.id}
              emptyMessage="No salary records found. Add one or adjust filters."
              renderActions={
                canEdit
                  ? (rec) => (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(rec)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )
                  : undefined
              }
              showActions={canEdit}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SalaryTable;
