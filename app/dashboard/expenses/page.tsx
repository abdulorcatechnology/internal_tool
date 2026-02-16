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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import currencyHelper from "@/lib/helper/currency";
import dateHelper from "@/lib/helper/date";
import expensesOptions from "@/lib/options/expenses";
import DayToDayForm from "@/components/expenses/AddDayToDayExpenseForm";
import FixedAssetForm from "@/components/expenses/AddFixedAsset";

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
        <h1 className="text-2xl font-semibold tracking-tight">
          Office Expenses
        </h1>
        <p className="text-muted-foreground">
          Fixed assets and day-to-day expenses.
        </p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase date</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && (
                    <TableHead className="w-[80px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedAssets.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.asset_name}
                    </TableCell>
                    <TableCell className="capitalize">{a.asset_type}</TableCell>
                    <TableCell>{formatDate(a.purchase_date)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(a.cost)}
                    </TableCell>
                    <TableCell>{a.employees?.full_name ?? "—"}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          a.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
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
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Receipt</TableHead>
                  {canEdit && (
                    <TableHead className="w-[80px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="capitalize">{e.category}</TableCell>
                    <TableCell>{e.vendor || "—"}</TableCell>
                    <TableCell>{formatDate(e.date)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(e.amount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          e.payment_status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        )}
                      >
                        {e.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {e.receipt_url ? (
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
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
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
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
