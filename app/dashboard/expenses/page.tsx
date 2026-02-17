"use client";

import { useState, useMemo } from "react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import DayToDayForm from "@/components/expenses/DayToDayExpense/AddDayToDayExpenseForm";
import FixedAssetForm from "@/components/expenses/FixedAsset/AddFixedAsset";
import Heading from "@/components/shared/Heading";
import DayToDayExpenseTable from "@/components/expenses/DayToDayExpense/DayToDayExpenseTable";
import FixedAssetTable from "@/components/expenses/FixedAsset/FixedAssetTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <Tabs defaultValue="day-to-day-expenses">
        <TabsList>
          <TabsTrigger value="day-to-day-expenses">
            Day to Day Expenses
          </TabsTrigger>
          <TabsTrigger value="fixed-assets">Fixed Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="day-to-day-expenses">
          <DayToDayExpenseTable
            canEdit={canEdit}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            dayExpenses={dayExpenses}
            dayLoading={dayLoading}
            setEditingDayExpense={setEditingDayExpense}
            setDaySheetOpen={setDaySheetOpen}
          />
        </TabsContent>
        <TabsContent value="fixed-assets">
          <FixedAssetTable
            canEdit={canEdit}
            assetTypeFilter={assetTypeFilter}
            setAssetTypeFilter={setAssetTypeFilter}
            assetStatusFilter={assetStatusFilter}
            setAssetStatusFilter={setAssetStatusFilter}
            fixedAssets={fixedAssets}
            isLoading={assetsLoading}
            setEditingAsset={setEditingAsset}
            setAssetSheetOpen={setAssetSheetOpen}
          />
        </TabsContent>
      </Tabs>

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
