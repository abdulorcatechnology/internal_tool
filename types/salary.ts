export type SalaryStatus = "pending" | "paid" | "deferred";

export type SalaryRecord = {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM-DD (first day of month)
  base_salary: number;
  deductions: number;
  bonus: number;
  net_salary: number;
  status: SalaryStatus;
  payment_date: string | null;
  comments: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SalaryRecordWithEmployee = SalaryRecord & {
  employees?: { full_name: string; employee_id: string | null } | null;
};

export type CreateSalaryRecordInput = {
  employee_id: string;
  month: string; // YYYY-MM-DD
  base_salary: number;
  deductions?: number;
  bonus?: number;
  status?: SalaryStatus;
  payment_date?: string | null;
  comments?: string | null;
  receipt_url?: string | null;
};

export type UpdateSalaryRecordInput = {
  base_salary?: number;
  deductions?: number;
  bonus?: number;
  status?: SalaryStatus;
  payment_date?: string | null;
  comments?: string | null;
  receipt_url?: string | null;
};

export type SalaryFilters = {
  month?: string; // YYYY-MM
  employee_id?: string;
  status?: SalaryStatus;
};
