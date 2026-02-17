import { Plus, Pencil, ExternalLink } from "lucide-react";
import type {
  DayToDayExpense,
  ExpenseCategory,
  ExpensePaymentStatus,
} from "@/types/expenses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import currencyHelper from "@/lib/helper/currency";
import monthHelper from "@/lib/helper/month";
import expensesOptions from "@/lib/options/expenses";

const formatCurrency = currencyHelper.formatCurrency;
const formatDate = monthHelper.formatDate;

interface DayToDayExpenseTableProps {
  canEdit: boolean;
  categoryFilter: ExpenseCategory | "all";
  setCategoryFilter: (category: ExpenseCategory | "all") => void;
  paymentStatusFilter: ExpensePaymentStatus | "all";
  setPaymentStatusFilter: (paymentStatus: ExpensePaymentStatus | "all") => void;
  dayExpenses: DayToDayExpense[];
  dayLoading: boolean;
  setEditingDayExpense: (expense: DayToDayExpense | null) => void;
  setDaySheetOpen: (open: boolean) => void;
}

const DayToDayExpenseTable = ({
  canEdit,
  categoryFilter,
  setCategoryFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  dayExpenses,
  dayLoading,
  setEditingDayExpense,
  setDaySheetOpen,
}: DayToDayExpenseTableProps) => {
  return (
    <>
      {/* Day-to-day */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Day-to-day expenses</CardTitle>
            <CardDescription>
              Utilities, rent, software, travel, etc.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={() => {
                setEditingDayExpense(null);
                setDaySheetOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add expense
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm">Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={(v) =>
                  setCategoryFilter(v as ExpenseCategory | "all")
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {expensesOptions.CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm">Payment</Label>
              <Select
                value={paymentStatusFilter}
                onValueChange={(v) =>
                  setPaymentStatusFilter(v as ExpensePaymentStatus | "all")
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {expensesOptions.PAYMENT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {dayLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Loading…
            </p>
          ) : dayExpenses.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No day-to-day expenses yet.
            </p>
          ) : (
            <DataTable<DayToDayExpense>
              columns={[
                {
                  id: "category",
                  header: "Category",
                  className: "capitalize",
                  cell: (e) => e.category,
                },
                {
                  id: "vendor",
                  header: "Vendor",
                  cell: (e) => e.vendor || "—",
                },
                {
                  id: "date",
                  header: "Date",
                  cell: (e) => formatDate(e.date),
                },
                {
                  id: "amount",
                  header: "Amount",
                  align: "right",
                  cell: (e) => formatCurrency(e.amount),
                },
                {
                  id: "payment",
                  header: "Payment",
                  cell: (e) => (
                    <StatusBadge
                      variant={
                        e.payment_status === "paid" ? "success" : "warning"
                      }
                    >
                      {e.payment_status}
                    </StatusBadge>
                  ),
                },
                {
                  id: "receipt",
                  header: "Receipt",
                  cell: (e) =>
                    e.receipt_url ? (
                      <a
                        href={e.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center gap-1 hover:underline"
                      >
                        View <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      "—"
                    ),
                },
              ]}
              data={dayExpenses}
              getRowKey={(e) => e.id}
              emptyMessage="No day-to-day expenses yet."
              renderActions={
                canEdit
                  ? (e) => (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingDayExpense(e);
                          setDaySheetOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )
                  : undefined
              }
              showActions={canEdit}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DayToDayExpenseTable;
