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
import ManageDepartment from "@/components/settings/ManageDepartments";
import ManageCurrencies from "@/components/settings/ManageCurrencies";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Heading
        title="Settings"
        description="Manage departments and other options."
      />
      <ManageDepartment />
      <ManageCurrencies />
    </div>
  );
}
