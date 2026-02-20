"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, UserX, UserCheck, Eye } from "lucide-react";
import {
  useEmployees,
  useDeactivateEmployee,
  useActivateEmployee,
} from "@/lib/api/employees";
import { useDepartments } from "@/lib/api/department";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { useProfile } from "@/lib/api/profile";
import AddEmployeesForm from "@/components/employees/AddEmployeesForm";
import monthHelper from "@/lib/helper/month";
import Heading from "@/components/shared/Heading";
import SelectDropdown from "@/components/shared/SelectDropdown";
import { STATUS_OPTIONS } from "@/lib/options/employees";
import EmployeeInfo from "@/components/employees/EmployeeInfo";

const formatDate = monthHelper.formatDate;

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">(
    "all",
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const filters = useMemo(() => {
    const f: {
      status?: EmployeeStatus;
      department_id?: string;
      country?: string;
    } = {};
    if (statusFilter !== "all") f.status = statusFilter;
    if (departmentFilter !== "all") f.department_id = departmentFilter;
    if (countryFilter !== "all") f.country = countryFilter;
    return f;
  }, [statusFilter, departmentFilter, countryFilter]);

  const { data: employees = [], isLoading } = useEmployees(filters);
  const { data: departments = [] } = useDepartments();
  const { data: profile } = useProfile();
  const deactivateMutation = useDeactivateEmployee();
  const activateMutation = useActivateEmployee();
  const canEdit = profile?.role === "admin" || profile?.role === "finance";

  function openAdd() {
    setEditingEmployee(null);
    setSheetOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditingEmployee(emp);
    setSheetOpen(true);
  }

  function openView(emp: Employee) {
    setViewingEmployee(emp);
    setViewOpen(true);
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

  async function handleActivate(emp: Employee) {
    if (
      !confirm(
        `Set ${emp.full_name} as Active? They will receive new salary records.`,
      )
    )
      return;
    try {
      await activateMutation.mutateAsync(emp.id);
    } catch (_) {}
  }

  const countryOptions = useMemo(() => {
    const values = [
      ...new Set(
        employees
          .map((e) => e.country)
          .filter((c): c is string => Boolean(c) && c !== "all"),
      ),
    ].sort();
    return [
      { value: "all", label: "All countries" },
      ...values.map((c) => ({ value: c, label: c })),
    ];
  }, [employees]);

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
            <SelectDropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as EmployeeStatus | "all")}
            />
            <SelectDropdown
              label="Department"
              options={[
                { value: "all", label: "All departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
              value={departmentFilter}
              onChange={setDepartmentFilter}
            />
            <SelectDropdown
              label="Country"
              options={countryOptions}
              value={countryFilter}
              onChange={(v) => setCountryFilter(v as string)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : (
            <DataTable<Employee>
              // onClick={(emp) => openView(emp)}
              columns={[
                {
                  id: "name",
                  header: "Name",
                  className: "font-medium",
                  cell: (emp) => emp.full_name,
                },
                {
                  id: "employee_id",
                  header: "Employee ID",
                  cell: (emp) => emp.employee_id ?? "—",
                },
                {
                  id: "department",
                  header: "Department",
                  cell: (emp) => emp.departments?.name ?? "—",
                },
                { id: "email", header: "Email", cell: (emp) => emp.email },
                {
                  id: "salary",
                  header: "Salary",
                  align: "right",
                  cell: (emp) =>
                    `${emp.currencies?.code} ${emp.monthly_salary}`,
                },
                {
                  id: "joining",
                  header: "Joining",
                  cell: (emp) => formatDate(emp.joining_date),
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (emp) => (
                    <StatusBadge
                      variant={emp.status === "active" ? "success" : "muted"}
                    >
                      {emp.status == "active" ? "Working" : "Not working"}
                    </StatusBadge>
                  ),
                },
              ]}
              data={employees}
              getRowKey={(emp) => emp.id}
              emptyMessage="No employees found. Add one to get started."
              renderActions={
                canEdit
                  ? (emp) => (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openView(emp)}
                          title="View"
                        >
                          <Eye className="size-4" />
                        </Button>
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
                        {emp.status === "inactive" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleActivate(emp)}
                            title="Set Active"
                            className="text-green-500 hover:text-green-500"
                          >
                            <UserCheck className="size-4" />
                          </Button>
                        )}
                      </div>
                    )
                  : undefined
              }
              showActions={canEdit}
              actionsHeaderClassName="w-[100px]"
            />
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

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          className="overflow-y-auto flex w-full flex-col sm:max-w-md"
          side="right"
        >
          <SheetHeader>
            <SheetTitle>Employee Information</SheetTitle>
            <SheetDescription>
              Full details for the selected employee.
            </SheetDescription>
          </SheetHeader>
          <EmployeeInfo employee={viewingEmployee} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
