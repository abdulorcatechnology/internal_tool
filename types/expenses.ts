export type AssetType = "laptop" | "server" | "phone" | "furniture";
export type AssetStatus = "active" | "retired";

export type FixedAsset = {
  id: string;
  asset_name: string;
  asset_type: AssetType;
  purchase_date: string;
  cost: number;
  assigned_employee_id: string | null;
  depreciation_rate: number | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
};

export type FixedAssetWithEmployee = FixedAsset & {
  employees?: { full_name: string; employee_id: string | null } | null;
};

export type CreateFixedAssetInput = {
  asset_name: string;
  asset_type: AssetType;
  purchase_date: string;
  cost: number;
  assigned_employee_id?: string | null;
  depreciation_rate?: number | null;
  status?: AssetStatus;
};

export type UpdateFixedAssetInput = Partial<CreateFixedAssetInput>;

export type FixedAssetFilters = {
  asset_type?: AssetType;
  status?: AssetStatus;
};

// --- Day-to-day ---

export type ExpenseCategory =
  | "utilities"
  | "internet"
  | "rent"
  | "software"
  | "travel"
  | "pantry"
  | "marketing"
  | "other";

export type ExpensePaymentStatus = "pending" | "paid";

export type DayToDayExpense = {
  id: string;
  category: ExpenseCategory;
  vendor: string;
  date: string;
  amount: number;
  payment_status: ExpensePaymentStatus;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDayToDayExpenseInput = {
  category: ExpenseCategory;
  vendor: string;
  date: string;
  amount: number;
  payment_status?: ExpensePaymentStatus;
  receipt_url?: string | null;
  notes?: string | null;
};

export type UpdateDayToDayExpenseInput = Partial<CreateDayToDayExpenseInput>;

export type DayToDayExpenseFilters = {
  category?: ExpenseCategory;
  payment_status?: ExpensePaymentStatus;
  month?: string; // YYYY-MM
};
