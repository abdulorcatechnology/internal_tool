export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
  role: string | null;
  email: string;
  monthly_salary: number;
  joining_date: string; // YYYY-MM-DD
  payment_method_notes: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

export type CreateEmployeeInput = {
  full_name: string;
  employee_id: string;
  department: string;
  role?: string | null;
  email: string;
  monthly_salary: number;
  joining_date: string;
  payment_method_notes?: string | null;
  status?: EmployeeStatus;
};

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export type EmployeesFilters = {
  department?: string;
  status?: EmployeeStatus;
};
