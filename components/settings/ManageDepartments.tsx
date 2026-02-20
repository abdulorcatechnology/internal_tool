"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProfile } from "@/lib/api/profile";
import {
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
} from "@/lib/api/department";
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

const ManageDepartment = () => {
  const { data: profile } = useProfile();
  const { data: departments = [], isLoading } = useDepartments();
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();
  const [newDept, setNewDept] = useState("");

  const isAdmin = profile?.role === "admin";

  function handleAdd() {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => setNewDept(""),
      },
    );
  }

  function handleRemove(id: string) {
    if (
      !confirm(
        "Remove this department? Employees using it will have no department.",
      )
    )
      return;
    deleteMutation.mutate(id);
  }
  return (
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
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAdd())
                  }
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAdd}
                disabled={!newDept.trim() || createMutation.isPending}
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
            {departments.length > 0 ? (
              <ul className="space-y-2">
                {departments.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span>{d.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(d.id)}
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
                No departments yet. Add one above.
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

export default ManageDepartment;
