"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProfile } from "@/lib/api/profile";
import {
  usePredefinedDepartments,
  useUpdatePredefinedDepartments,
} from "@/lib/api/settings";
import Heading from "@/components/shared/Heading";
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

export default function SettingsPage() {
  const { data: profile } = useProfile();
  const { data: departments = [], isLoading } = usePredefinedDepartments();
  const updateMutation = useUpdatePredefinedDepartments();
  const [localList, setLocalList] = useState<string[]>([]);
  const [newDept, setNewDept] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    setLocalList(departments);
  }, [departments]);

  function handleAdd() {
    const trimmed = newDept.trim();
    if (!trimmed || localList.includes(trimmed)) return;
    setLocalList((prev) => [...prev, trimmed].sort());
    setNewDept("");
  }

  function handleRemove(name: string) {
    setLocalList((prev) => prev.filter((d) => d !== name));
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync(localList);
    } catch (_) {}
  }

  const hasChanges =
    localList.length !== departments.length ||
    localList.some((d, i) => departments[i] !== d);

  return (
    <div className="space-y-6">
      <Heading
        title="Settings"
        description="Manage predefined departments and other options."
      />
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Add departments here. When adding or editing an employee, only these
            departments can be selected so names stay consistent (e.g. no
            &quot;tech&quot; vs &quot;Technology&quot;).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin ? (
            <p className="text-sm text-muted-foreground">
              Only admins can change departments.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="new-dept" className="text-sm">
                    New department
                  </Label>
                  <Input
                    id="new-dept"
                    placeholder="e.g. Engineering"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleAdd}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {localList.length > 0 && (
                <ul className="space-y-2">
                  {localList.map((name) => (
                    <li
                      key={name}
                      className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span>{name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemove(name)}
                        title="Remove"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {localList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No departments yet. Add one above.
                </p>
              )}
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save departments"}
                </Button>
              )}
              {updateMutation.isError && (
                <p className="text-sm text-destructive" role="alert">
                  {updateMutation.error?.message}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
