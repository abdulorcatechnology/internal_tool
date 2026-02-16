import { ChartConfig } from "@/components/ui/chart";

export const payrollChartConfig = {
  total: {
    label: "Payroll",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const trendChartConfig = {
  payroll: {
    label: "Payroll",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
