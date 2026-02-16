"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStats, usePayrollByMonth } from "@/lib/api/dashboard";
import currencyHelper from "@/lib/helper/currency";

const formatCurrency = currencyHelper.formatCurrency;

const payrollChartConfig = {
  total: {
    label: "Payroll",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: payrollByMonth = [], isLoading: chartLoading } = usePayrollByMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of payroll and expenses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total monthly payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {statsLoading ? "…" : formatCurrency(stats?.totalMonthlyPayroll ?? 0)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending salaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {statsLoading ? "…" : stats?.pendingSalariesCount ?? 0}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual payroll (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {statsLoading ? "…" : formatCurrency(stats?.annualPayrollYTD ?? 0)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Office expenses (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {statsLoading ? "…" : formatCurrency(stats?.expensesThisMonth ?? 0)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fixed assets (total value)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {statsLoading ? "…" : formatCurrency(stats?.fixedAssetsTotalValue ?? 0)}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll by month</CardTitle>
          <CardDescription>Last 12 months total payroll.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : payrollByMonth.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
              No payroll data yet.
            </div>
          ) : (
            <ChartContainer config={payrollChartConfig} className="h-[280px] w-full">
              <BarChart
                data={payrollByMonth}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => formatCurrency(Number(v))}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
