import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import monthHelper from "@/lib/helper/month";

const DASHBOARD_KEY = ["dashboard"] as const;

function supabase() {
  return createClient();
}

export type DashboardStats = {
  totalMonthlyPayroll: number;
  pendingSalariesCount: number;
  annualPayrollYTD: number;
  expensesThisMonth: number;
  fixedAssetsTotalValue: number;
};

export type PayrollByMonth = { month: string; total: number; label: string };

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const currentYm = monthHelper.getCurrentMonthYMD();
  const yearStart = `${now.getFullYear()}-01-01`;
  const currentMonthStart = monthHelper.monthToDate(currentYm);
  const currentMonthEnd = monthHelper.nextMonth(currentMonthStart);

  const [
    { data: salaryRecords },
    { data: dayExpenses },
    { data: fixedAssets },
  ] = await Promise.all([
    supabase()
      .from("salary_records")
      .select("month, net_salary, status")
      .gte("month", yearStart)
      .lt("month", currentMonthEnd),
    supabase()
      .from("day_to_day_expenses")
      .select("amount")
      .gte("date", currentMonthStart)
      .lt("date", currentMonthEnd),
    supabase().from("fixed_assets").select("cost").eq("status", "active"),
  ]);

  const salaryList = (salaryRecords ?? []) as {
    month: string;
    net_salary: number;
    status: string;
  }[];
  const currentMonthRecords = salaryList.filter(
    (r) => r.month.slice(0, 7) === currentYm,
  );

  const totalMonthlyPayroll = currentMonthRecords.reduce(
    (s, r) => s + Number(r.net_salary),
    0,
  );
  const pendingSalariesCount = currentMonthRecords.filter(
    (r) => r.status === "pending",
  ).length;
  const annualPayrollYTD = salaryList.reduce(
    (s, r) => s + Number(r.net_salary),
    0,
  );
  const expensesThisMonth = (dayExpenses ?? []).reduce(
    (s: number, r: { amount: number }) => s + Number(r.amount),
    0,
  );
  const fixedAssetsTotalValue = (fixedAssets ?? []).reduce(
    (s: number, r: { cost: number }) => s + Number(r.cost),
    0,
  );

  return {
    totalMonthlyPayroll,
    pendingSalariesCount,
    annualPayrollYTD,
    expensesThisMonth,
    fixedAssetsTotalValue,
  };
}

export async function fetchPayrollByMonth(): Promise<PayrollByMonth[]> {
  const startYm = monthHelper.getTwelveMonthsAgoYMD();
  const endYm = monthHelper.getCurrentMonthYMD();
  const startDate = monthHelper.monthToDate(startYm);
  const endDate = monthHelper.nextMonth(monthHelper.monthToDate(endYm));

  const { data, error } = await supabase()
    .from("salary_records")
    .select("month, net_salary")
    .gte("month", startDate)
    .lt("month", endDate);

  if (error) throw error;
  const list = (data ?? []) as { month: string; net_salary: number }[];

  const byMonth = new Map<string, number>();
  for (const r of list) {
    const ym = r.month.slice(0, 7);
    byMonth.set(ym, (byMonth.get(ym) ?? 0) + Number(r.net_salary));
  }

  const result: PayrollByMonth[] = [];
  const d = new Date(startYm + "-01");
  const end = new Date(endYm + "-01");
  while (d <= end) {
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: ym,
      total: byMonth.get(ym) ?? 0,
      label: monthHelper.formatMonth(ym),
    });
    d.setMonth(d.getMonth() + 1);
  }

  return result.reverse();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "stats"] as const,
    queryFn: fetchDashboardStats,
  });
}

export function usePayrollByMonth() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "payrollByMonth"] as const,
    queryFn: fetchPayrollByMonth,
  });
}
