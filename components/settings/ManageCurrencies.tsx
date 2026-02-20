"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProfile } from "@/lib/api/profile";
import {
  useCurrencies,
  useCreateCurrency,
  useDeleteCurrency,
} from "@/lib/api/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ManageCurrencies = () => {
  const { data: profile } = useProfile();
  const { data: currencies = [], isLoading } = useCurrencies();
  const createMutation = useCreateCurrency();
  const deleteMutation = useDeleteCurrency();
  const [newCurrency, setNewCurrency] = useState("");

  const isAdmin = profile?.role === "admin";

  function handleAdd() {
    const trimmed = newCurrency.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { code: trimmed },
      {
        onSuccess: () => setNewCurrency(""),
      },
    );
  }

  function handleRemove(id: string) {
    if (
      !confirm(
        "Remove this currency? Employees using it will have no currency.",
      )
    )
      return;
    deleteMutation.mutate(id);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Currencies</CardTitle>
        <CardDescription>
          Add currencies here. When adding or editing an employee, only these
          currencies can be selected so codes stay consistent (e.g. no
          &quot;USD&quot; vs &quot;US Dollar&quot;).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">
            Only admins can change currencies.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="new-currency" className="text-sm">
                  New currency
                </Label>
                <Input
                  id="new-currency"
                  placeholder="e.g. USD"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAdd())
                  }
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAdd}
                disabled={!newCurrency.trim() || createMutation.isPending}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            {createMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {createMutation.error?.message}
              </p>
            )}
            {currencies.length > 0 ? (
              <ul className="space-y-2">
                {currencies.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span>{c.code}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(c.id)}
                      title="Remove"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No currencies yet. Add one above.
              </p>
            )}
            {deleteMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {deleteMutation.error?.message}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageCurrencies;
