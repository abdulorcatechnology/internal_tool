"use client";

import Heading from "@/components/shared/Heading";
import ManageDepartment from "@/components/settings/ManageDepartments";
import ManageCurrencies from "@/components/settings/ManageCurrencies";
import ManageReportingCurrency from "@/components/settings/ManageReportingCurrency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Heading
        title="Settings"
        description="Manage departments, currencies, and reporting."
      />
      <Tabs defaultValue="departments">
        <TabsList className="w-full">
          <TabsTrigger value="departments" className="w-full">
            Departments
          </TabsTrigger>
          <TabsTrigger value="currencies" className="w-full">
            Currencies
          </TabsTrigger>
          <TabsTrigger value="reporting" className="w-full">
            Reporting
          </TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <ManageDepartment />
        </TabsContent>
        <TabsContent value="currencies">
          <ManageCurrencies />
        </TabsContent>
        <TabsContent value="reporting">
          <ManageReportingCurrency />
        </TabsContent>
      </Tabs>
      {/* 
      <ManageDepartment />
      <ManageCurrencies /> */}
    </div>
  );
}
