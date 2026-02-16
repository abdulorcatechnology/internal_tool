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
import { cn } from "@/lib/utils";
import monthHelper from "@/lib/helper/month";
import AddSalaryForm from "@/components/salary/AddSalaryForm";
import currencyHelper from "@/lib/helper/currency";
import dateHelper from "@/lib/helper/date";

import salaryOptions from "@/lib/options/salary";
import { Employee } from "@/types/employees";
import SelectDropdown from "../shared/SelectDropdown";

const MONTH_OPTIONS = monthHelper.getMonthOptions();
const formatMonth = monthHelper.formatMonth;
const formatCurrency = currencyHelper.formatCurrency;
const formatDate = dateHelper.formatDate;

interface SalaryTableProps {
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (value: string) => void;
  statusFilter: SalaryStatus | "all";
  setStatusFilter: (value: SalaryStatus | "all") => void;
  canEdit: boolean;
  records: SalaryRecordWithEmployee[];
  isLoading: boolean;
  employees: Employee[];
  openEdit: (rec: SalaryRecordWithEmployee) => void;
  openAdd: () => void;
}

const SalaryTable = ({
  monthFilter,
  setMonthFilter,
  employeeFilter,
  setEmployeeFilter,
  statusFilter,
  setStatusFilter,
  canEdit,
  records,
  isLoading,
  employees,
  openEdit,
  openAdd,
}: SalaryTableProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Salary records</CardTitle>
          <CardDescription>
            Filter by month, employee, and status.
          </CardDescription>
          <div className="flex flex-wrap gap-4 pt-2">
            <SelectDropdown
              label="Month"
              options={[
                { value: "all", label: "All months" },
                ...MONTH_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
              value={monthFilter || "all"}
              onChange={(v) => setMonthFilter(v === "all" ? "" : v)}
            />
            <SelectDropdown
              label="Employee"
              options={[
                { value: "all", label: "All employees" },
                ...employees.map((e) => ({ value: e.id, label: e.full_name })),
              ]}
              value={employeeFilter || "all"}
              onChange={setEmployeeFilter}
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
          ) : records?.length === 0 ? (
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
    </>
  );
};

export default SalaryTable;
