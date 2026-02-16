"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { useFixedAssets } from "@/lib/api/expenses";
import { useDayToDayExpenses } from "@/lib/api/expenses";
import { useProfile } from "@/lib/api/profile";
import type {
  FixedAssetWithEmployee,
  FixedAssetFilters,
  AssetType,
  AssetStatus,
  DayToDayExpense,
  DayToDayExpenseFilters,
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import dateHelper from "@/lib/helper/date";
import expensesOptions from "@/lib/options/expenses";
import DayToDayForm from "@/components/expenses/DayToDayExpense/AddDayToDayExpenseForm";
import FixedAssetForm from "@/components/expenses/FixedAsset/AddFixedAsset";
import Heading from "@/components/shared/Heading";

const formatCurrency = currencyHelper.formatCurrency;
const formatDate = dateHelper.formatDate;

// ----- Page -----
export default function ExpensesPage() {
  const { data: profile } = useProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "finance";

  // Fixed assets state
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | "all">(
    "all",
  );
  const [assetStatusFilter, setAssetStatusFilter] = useState<
    AssetStatus | "all"
  >("all");
  const [assetSheetOpen, setAssetSheetOpen] = useState(false);
  const [editingAsset, setEditingAsset] =
    useState<FixedAssetWithEmployee | null>(null);

  const assetFilters = useMemo(() => {
    const f: FixedAssetFilters = {};
    if (assetTypeFilter !== "all") f.asset_type = assetTypeFilter;
    if (assetStatusFilter !== "all") f.status = assetStatusFilter;
    return f;
  }, [assetTypeFilter, assetStatusFilter]);

  const { data: fixedAssets = [], isLoading: assetsLoading } =
    useFixedAssets(assetFilters);

  // Day-to-day state
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">(
    "all",
  );
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    ExpensePaymentStatus | "all"
  >("all");
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [editingDayExpense, setEditingDayExpense] =
    useState<DayToDayExpense | null>(null);

  const dayFilters = useMemo(() => {
    const f: DayToDayExpenseFilters = {};
    if (categoryFilter !== "all") f.category = categoryFilter;
    if (paymentStatusFilter !== "all") f.payment_status = paymentStatusFilter;
    return f;
  }, [categoryFilter, paymentStatusFilter]);

  const { data: dayExpenses = [], isLoading: dayLoading } =
    useDayToDayExpenses(dayFilters);

  return (
    <div className="space-y-8">
      <div>
        <Heading
          title="Expenses"
          description="Laptops, servers, phones, furniture. Utilities, rent, software, travel, etc."
        />
      </div>

      {/* Fixed assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Fixed assets</CardTitle>
            <CardDescription>
              Laptops, servers, phones, furniture.
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              onClick={() => {
                setEditingAsset(null);
                setAssetSheetOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add asset
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm">Type</Label>
              <Select
                value={assetTypeFilter}
                onValueChange={(v) =>
                  setAssetTypeFilter(v as AssetType | "all")
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {expensesOptions.ASSET_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm">Status</Label>
              <Select
                value={assetStatusFilter}
                onValueChange={(v) =>
                  setAssetStatusFilter(v as AssetStatus | "all")
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {expensesOptions.ASSET_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {assetsLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Loading…
            </p>
          ) : fixedAssets.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No fixed assets yet.
            </p>
          ) : (
            <DataTable<FixedAssetWithEmployee>
              columns={[
                {
                  id: "asset",
                  header: "Asset",
                  className: "font-medium",
                  cell: (a) => a.asset_name,
                },
                {
                  id: "type",
                  header: "Type",
                  className: "capitalize",
                  cell: (a) => a.asset_type,
                },
                {
                  id: "purchase_date",
                  header: "Purchase date",
                  cell: (a) => formatDate(a.purchase_date),
                },
                {
                  id: "cost",
                  header: "Cost",
                  align: "right",
                  cell: (a) => formatCurrency(a.cost),
                },
                {
                  id: "assigned",
                  header: "Assigned to",
                  cell: (a) => a.employees?.full_name ?? "—",
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (a) => (
                    <StatusBadge
                      variant={a.status === "active" ? "success" : "muted"}
                    >
                      {a.status}
                    </StatusBadge>
                  ),
                },
              ]}
              data={fixedAssets}
              getRowKey={(a) => a.id}
              emptyMessage="No fixed assets yet."
              renderActions={
                canEdit
                  ? (a) => (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingAsset(a);
                          setAssetSheetOpen(true);
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

      <Sheet open={assetSheetOpen} onOpenChange={setAssetSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <FixedAssetForm
            asset={editingAsset}
            onSuccess={() => setAssetSheetOpen(false)}
            onCancel={() => setAssetSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <Sheet open={daySheetOpen} onOpenChange={setDaySheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <DayToDayForm
            expense={editingDayExpense}
            onSuccess={() => setDaySheetOpen(false)}
            onCancel={() => setDaySheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
