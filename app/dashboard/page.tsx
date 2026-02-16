"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useDashboardStats,
  usePayrollByMonth,
  usePayrollAndExpensesByMonth,
} from "@/lib/api/dashboard";
import currencyHelper from "@/lib/helper/currency";
import {
  payrollChartConfig,
  trendChartConfig,
} from "@/lib/options/dashboard";

const formatCurrency = currencyHelper.formatCurrency;

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: payrollByMonth = [], isLoading: chartLoading } =
    usePayrollByMonth();
  const {
    data: trendData = [],
    isLoading: trendLoading,
  } = usePayrollAndExpensesByMonth();

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
              {statsLoading
                ? "…"
                : formatCurrency(stats?.totalMonthlyPayroll ?? 0)}
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
              {statsLoading ? "…" : (stats?.pendingSalariesCount ?? 0)}
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
              {statsLoading
                ? "…"
                : formatCurrency(stats?.annualPayrollYTD ?? 0)}
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
              {statsLoading
                ? "…"
                : formatCurrency(stats?.expensesThisMonth ?? 0)}
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
              {statsLoading
                ? "…"
                : formatCurrency(stats?.fixedAssetsTotalValue ?? 0)}
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
            <ChartContainer
              config={payrollChartConfig}
              className="h-[280px] w-full"
            >
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

      {/* Expense vs Payroll comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Expense vs Payroll</CardTitle>
          <CardDescription>
            Compare monthly payroll and office expenses side by side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
              No data yet.
            </div>
          ) : (
            <ChartContainer
              config={trendChartConfig}
              className="h-[280px] w-full"
            >
              <BarChart
                data={trendData}
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
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="payroll"
                  fill="var(--color-payroll)"
                  radius={[4, 4, 0, 0]}
                  name="Payroll"
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--color-expenses)"
                  radius={[4, 4, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Yearly trend – Payroll */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly trend – Payroll</CardTitle>
          <CardDescription>
            Total payroll by month over the last 12 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
              No data yet.
            </div>
          ) : (
            <ChartContainer
              config={payrollChartConfig}
              className="h-[280px] w-full"
            >
              <LineChart
                data={trendData}
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
                <Line
                  type="monotone"
                  dataKey="payroll"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-total)" }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Yearly trend – Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly trend – Expenses</CardTitle>
          <CardDescription>
            Office expenses by month over the last 12 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
              No data yet.
            </div>
          ) : (
            <ChartContainer
              config={trendChartConfig}
              className="h-[280px] w-full"
            >
              <LineChart
                data={trendData}
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
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-expenses)" }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
