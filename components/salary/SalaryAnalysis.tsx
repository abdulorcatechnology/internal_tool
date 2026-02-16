"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSalaryRecordsForYear } from "@/lib/api/salary";
import currencyHelper from "@/lib/helper/currency";
import monthHelper from "@/lib/helper/month";
import { payrollChartConfig } from "@/lib/options/dashboard";
import type { SalaryRecordWithEmployee } from "@/types/salary";

const formatCurrency = currencyHelper.formatCurrency;
const formatMonth = monthHelper.formatMonth;

type YtdEmployee = {
  employeeId: string;
  name: string;
  employeeIdLabel: string | null;
  ytd: number;
  monthlyBreakdown: { month: string; label: string; total: number }[];
  pendingCount: number;
  paidCount: number;
  deferredCount: number;
};

type MonthTotal = { month: string; label: string; total: number };

function useSalaryAnalysis(year?: number) {
  const { data: records = [], isLoading } = useSalaryRecordsForYear(year);
  const currentYear = year ?? new Date().getFullYear();

  return useMemo(() => {
    const ytdByEmployee = new Map<
      string,
      {
        ytd: number;
        monthly: Map<string, number>;
        pending: number;
        paid: number;
        deferred: number;
        name: string;
        employeeIdLabel: string | null;
      }
    >();

    const companyByMonth = new Map<string, number>();
    let totalPayroll = 0;
    const statusCounts = { pending: 0, paid: 0, deferred: 0 };

    for (const r of records) {
      const empId = r.employee_id;
      const ym = r.month.slice(0, 7);
      const net = Number(r.net_salary);

      totalPayroll += net;
      companyByMonth.set(ym, (companyByMonth.get(ym) ?? 0) + net);

      if (r.status === "pending") statusCounts.pending++;
      else if (r.status === "paid") statusCounts.paid++;
      else statusCounts.deferred++;

      if (!ytdByEmployee.has(empId)) {
        ytdByEmployee.set(empId, {
          ytd: 0,
          monthly: new Map(),
          pending: 0,
          paid: 0,
          deferred: 0,
          name: (r as SalaryRecordWithEmployee).employees?.full_name ?? "—",
          employeeIdLabel: (r as SalaryRecordWithEmployee).employees?.employee_id ?? null,
        });
      }
      const emp = ytdByEmployee.get(empId)!;
      emp.ytd += net;
      emp.monthly.set(ym, (emp.monthly.get(ym) ?? 0) + net);
      if (r.status === "pending") emp.pending++;
      else if (r.status === "paid") emp.paid++;
      else emp.deferred++;
    }

    const ytdList: YtdEmployee[] = Array.from(ytdByEmployee.entries()).map(
      ([employeeId, data]) => {
        const months: MonthTotal[] = [];
        for (let m = 1; m <= 12; m++) {
          const ym = `${currentYear}-${String(m).padStart(2, "0")}`;
          months.push({
            month: ym,
            label: formatMonth(ym),
            total: data.monthly.get(ym) ?? 0,
          });
        }
        return {
          employeeId,
          name: data.name,
          employeeIdLabel: data.employeeIdLabel,
          ytd: data.ytd,
          monthlyBreakdown: months,
          pendingCount: data.pending,
          paidCount: data.paid,
          deferredCount: data.deferred,
        };
      }
    );

    const monthList: MonthTotal[] = [];
    for (let m = 1; m <= 12; m++) {
      const ym = `${currentYear}-${String(m).padStart(2, "0")}`;
      monthList.push({
        month: ym,
        label: formatMonth(ym),
        total: companyByMonth.get(ym) ?? 0,
      });
    }

    const nonZeroMonths = monthList.filter((x) => x.total > 0);
    const highestMonth =
      nonZeroMonths.length > 0
        ? nonZeroMonths.reduce((a, b) => (a.total >= b.total ? a : b))
        : null;
    const lowestMonth =
      nonZeroMonths.length > 0
        ? nonZeroMonths.reduce((a, b) => (a.total <= b.total ? a : b))
        : null;
    const uniqueEmployees = ytdByEmployee.size;
    const averagePerEmployee =
      uniqueEmployees > 0 ? totalPayroll / uniqueEmployees : 0;

    return {
      isLoading,
      ytdList: ytdList.sort((a, b) => b.ytd - a.ytd),
      monthList,
      totalPayroll,
      statusCounts,
      highestMonth,
      lowestMonth,
      averagePerEmployee,
      uniqueEmployees,
    };
  }, [records, currentYear, isLoading]);
}

export default function SalaryAnalysis() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const {
    isLoading,
    ytdList,
    monthList,
    totalPayroll,
    statusCounts,
    highestMonth,
    lowestMonth,
    averagePerEmployee,
    uniqueEmployees,
  } = useSalaryAnalysis();

  const selectedEmployee = selectedEmployeeId
    ? ytdList.find((e) => e.employeeId === selectedEmployeeId)
    : ytdList[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading analysis…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Individual View */}
      <Card>
        <CardHeader>
          <CardTitle>Individual view</CardTitle>
          <CardDescription>
            Total salary paid YTD per employee. Select an employee for monthly
            breakdown and Pending vs Paid summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">YTD paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Deferred</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ytdList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-8">
                    No salary records this year.
                  </TableCell>
                </TableRow>
              ) : (
                ytdList.map((e) => (
                  <TableRow key={e.employeeId}>
                    <TableCell className="font-medium">
                      {e.name}
                      {e.employeeIdLabel ? ` (${e.employeeIdLabel})` : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(e.ytd)}
                    </TableCell>
                    <TableCell className="text-right">{e.pendingCount}</TableCell>
                    <TableCell className="text-right">{e.paidCount}</TableCell>
                    <TableCell className="text-right">{e.deferredCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {ytdList.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <Label>Employee for monthly breakdown</Label>
                <Select
                  value={selectedEmployeeId || ytdList[0]?.employeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ytdList.map((e) => (
                      <SelectItem key={e.employeeId} value={e.employeeId}>
                        {e.name}
                        {e.employeeIdLabel ? ` (${e.employeeIdLabel})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedEmployee && (
                <>
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Pending vs Paid: {selectedEmployee.pendingCount} pending,{" "}
                      {selectedEmployee.paidCount} paid,{" "}
                      {selectedEmployee.deferredCount} deferred
                    </p>
                  </div>
                  <ChartContainer
                    config={payrollChartConfig}
                    className="h-[260px] w-full"
                  >
                    <BarChart
                      data={selectedEmployee.monthlyBreakdown}
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
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Company View */}
      <Card>
        <CardHeader>
          <CardTitle>Company view</CardTitle>
          <CardDescription>
            Total annual payroll, month-wise graph, and highlights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total annual payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {formatCurrency(totalPayroll)}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Highest payroll month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xl font-bold">
                  {highestMonth
                    ? `${formatMonth(highestMonth.month)} (${formatCurrency(highestMonth.total)})`
                    : "—"}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lowest payroll month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xl font-bold">
                  {lowestMonth
                    ? `${formatMonth(lowestMonth.month)} (${formatCurrency(lowestMonth.total)})`
                    : "—"}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg salary per employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {formatCurrency(averagePerEmployee)}
                </span>
                <p className="text-muted-foreground text-xs mt-1">
                  {uniqueEmployees} employee{uniqueEmployees !== 1 ? "s" : ""} with records
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Month-wise payroll</h4>
            <ChartContainer
              config={payrollChartConfig}
              className="h-[280px] w-full"
            >
              <BarChart
                data={monthList}
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
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Pending vs Paid (company)</h4>
            <p className="text-muted-foreground text-sm">
              Pending: {statusCounts.pending} · Paid: {statusCounts.paid} ·
              Deferred: {statusCounts.deferred}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
