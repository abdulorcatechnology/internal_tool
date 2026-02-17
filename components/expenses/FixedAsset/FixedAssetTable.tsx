"use client";
import { Plus, Pencil } from "lucide-react";
import type {
  FixedAssetWithEmployee,
  AssetType,
  AssetStatus,
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

interface FixedAssetTableProps {
  canEdit: boolean;
  assetTypeFilter: AssetType | "all";
  setAssetTypeFilter: (assetType: AssetType | "all") => void;
  assetStatusFilter: AssetStatus | "all";
  setAssetStatusFilter: (assetStatus: AssetStatus | "all") => void;
  fixedAssets: FixedAssetWithEmployee[];
  isLoading: boolean;
  setEditingAsset: (asset: FixedAssetWithEmployee | null) => void;
  setAssetSheetOpen: (open: boolean) => void;
}

const FixedAssetTable = ({
  canEdit,
  assetTypeFilter,
  setAssetTypeFilter,
  assetStatusFilter,
  setAssetStatusFilter,
  fixedAssets,
  isLoading,
  setEditingAsset,
  setAssetSheetOpen,
}: FixedAssetTableProps) => {
  return (
    <>
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
          {isLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Loading…
            </p>
          ) : fixedAssets?.length === 0 ? (
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
    </>
  );
};

export default FixedAssetTable;
