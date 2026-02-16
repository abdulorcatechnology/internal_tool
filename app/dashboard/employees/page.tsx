"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, UserX } from "lucide-react";
import { useEmployees, useDeactivateEmployee } from "@/lib/api/employees";
import type { Employee, EmployeeStatus } from "@/types/employees";
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
import { useProfile } from "@/lib/api/profile";
import AddEmployeesForm from "@/components/employees/AddEmployeesForm";
import dateHelper from "@/lib/helper/date";
import currencyHelper from "@/lib/helper/currency";
import Heading from "@/components/shared/Heading";

const STATUS_OPTIONS: { value: EmployeeStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatDate = dateHelper.formatDate;
const formatCurrency = currencyHelper.formatCurrency;

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
          <Heading
            title="Employees"
            description="Add, edit, and manage employees. Use Inactive to soft-delete."
          />
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
                    <TableCell>{emp.employee_id ?? "—"}</TableCell>
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
          <AddEmployeesForm
            employee={editingEmployee}
            onSuccess={() => setSheetOpen(false)}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
