import { ChartConfig } from "@/components/ui/chart";

/* Vibrant chart colors (Orca blue, emerald, amber) */
export const payrollChartConfig = {
  total: {
    label: "Payroll",
    color: "#0096FF",
  },
} satisfies ChartConfig;

export const trendChartConfig = {
  payroll: {
    label: "Payroll",
    color: "#0096FF",
  },
  expenses: {
    label: "Expenses",
    color: "#10b981",
  },
} satisfies ChartConfig;
