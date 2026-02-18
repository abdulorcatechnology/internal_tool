"use client";

import type { Employee } from "@/types/employees";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/shared/StatusBadge";
import monthHelper from "@/lib/helper/month";
import currencyHelper from "@/lib/helper/currency";

const formatDate = monthHelper.formatDate;
const formatCurrency = currencyHelper.formatCurrency;

type EmployeeInfoProps = {
  employee: Employee | null;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-muted-foreground text-xs font-normal">
        {label}
      </Label>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}

export default function EmployeeInfo({ employee }: EmployeeInfoProps) {
  if (!employee) return null;

  return (
    <div className="space-y-6 pt-2 flex flex-col gap-4 overflow-auto p-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <h3 className="text-muted-foreground col-span-full text-xs font-medium uppercase tracking-wider">
          Identity
        </h3>
        <InfoRow label="Full name" value={employee.full_name} />
        <InfoRow label="Employee ID" value={employee.employee_id} />
        <InfoRow label="Email" value={employee.email} />
        <InfoRow label="Phone" value={employee.phone} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h3 className="text-muted-foreground col-span-full text-xs font-medium uppercase tracking-wider">
          Employment
        </h3>
        <InfoRow
          label="Department"
          value={employee.departments?.name ?? null}
        />
        <InfoRow label="Role" value={employee.role} />
        <InfoRow
          label="Status"
          value={
            <StatusBadge
              variant={employee.status === "active" ? "success" : "muted"}
            >
              {employee.status === "active" ? "Working" : "Not working"}
            </StatusBadge>
          }
        />
        <InfoRow
          label="Joining date"
          value={formatDate(employee.joining_date)}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h3 className="text-muted-foreground col-span-full text-xs font-medium uppercase tracking-wider">
          Location
        </h3>
        <InfoRow label="City" value={employee.city || null} />
        <InfoRow label="Country" value={employee.country || null} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h3 className="text-muted-foreground col-span-full text-xs font-medium uppercase tracking-wider">
          Compensation
        </h3>
        <InfoRow
          label="Monthly salary"
          value={
            employee.currency
              ? `${employee.currency} ${formatCurrency(employee.monthly_salary)}`
              : formatCurrency(employee.monthly_salary)
          }
        />
        <InfoRow
          label="Payment method / notes"
          value={employee.payment_method_notes}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        <h3 className="text-muted-foreground col-span-full text-xs font-medium uppercase tracking-wider">
          Record
        </h3>
        <InfoRow label="Created" value={formatDate(employee.created_at)} />
        <InfoRow label="Last updated" value={formatDate(employee.updated_at)} />
      </section>
    </div>
  );
}
