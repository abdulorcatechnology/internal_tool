"use client";

import Heading from "@/components/shared/Heading";
import ManageDepartment from "@/components/settings/ManageDepartments";
import ManageCurrencies from "@/components/settings/ManageCurrencies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Heading
        title="Settings"
        description="Manage departments and other options."
      />
      <Tabs defaultValue="departments">
        <TabsList className="w-full">
          <TabsTrigger value="departments" className="w-full">
            Departments
          </TabsTrigger>
          <TabsTrigger value="currencies" className="w-full">
            Currencies
          </TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <ManageDepartment />
        </TabsContent>
        <TabsContent value="currencies">
          <ManageCurrencies />
        </TabsContent>
      </Tabs>
      {/* 
      <ManageDepartment />
      <ManageCurrencies /> */}
    </div>
  );
}
