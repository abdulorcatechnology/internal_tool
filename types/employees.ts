export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: string;
  full_name: string;
  employee_id: string | null;
  department_id: string | null;
  departments?: { id: string; name: string } | null;
  role: string | null;
  email: string;
  monthly_salary: number;
  joining_date: string; // YYYY-MM-DD
  payment_method_notes: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
  country: string;
  city: string;
  currency_id: string | null;
  currencies?: { id: string; code: string } | null;
  phone?: string | null;
};

export type CreateEmployeeInput = {
  full_name: string;
  employee_id?: string | null;
  department_id?: string | null;
  role?: string | null;
  email: string;
  monthly_salary: number;
  joining_date: string;
  payment_method_notes?: string | null;
  status?: EmployeeStatus;
  country: string;
  city: string;
  currency_id?: string | null;
  phone?: string | null;
};

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export type EmployeesFilters = {
  department_id?: string | null;
  status?: EmployeeStatus;
  country?: string | null;
  city?: string | null;
  currency_id?: string | null;
};
