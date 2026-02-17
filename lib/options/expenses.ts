import {
  AssetType,
  AssetStatus,
  ExpenseCategory,
  ExpensePaymentStatus,
} from "@/types/expenses";

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "laptop", label: "Laptop" },
  { value: "server", label: "Server" },
  { value: "phone", label: "Phone" },
  { value: "furniture", label: "Furniture" },
];

const ASSET_STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "retired", label: "Retired" },
];

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "utilities", label: "Utilities" },
  { value: "internet", label: "Internet" },
  { value: "rent", label: "Rent" },
  { value: "software", label: "Software" },
  { value: "travel", label: "Travel" },
  { value: "pantry", label: "Pantry" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const PAYMENT_STATUS_OPTIONS: { value: ExpensePaymentStatus; label: string }[] =
  [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
  ];

export default {
  ASSET_TYPE_OPTIONS,
  ASSET_STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
};
