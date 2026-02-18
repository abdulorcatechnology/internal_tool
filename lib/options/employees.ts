import { EmployeeStatus } from "@/types/employees";

export const STATUS_OPTIONS: {
  value: EmployeeStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Working" },
  { value: "inactive", label: "Not working" },
];
