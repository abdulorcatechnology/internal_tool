import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import monthHelper from "@/lib/helper/month";
import {
  fetchReportingCurrencyId,
  fetchExchangeRates,
} from "@/lib/api/settings";

const DASHBOARD_KEY = ["dashboard"] as const;

type ExchangeRates = Record<string, number>;

function convertToReporting(
  amount: number,
  currencyId: string | null,
  reportingCurrencyId: string | null,
  rates: ExchangeRates,
): number {
  if (!reportingCurrencyId || !currencyId) return amount;
  if (currencyId === reportingCurrencyId) return amount;
  const rate = rates[currencyId];
  if (rate == null || rate <= 0) return amount;
  return amount * rate;
}

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

export type PayrollAndExpensesByMonth = {
  month: string;
  label: string;
  payroll: number;
  expenses: number;
};

export async function fetchPayrollAndExpensesByMonth(): Promise<
  PayrollAndExpensesByMonth[]
> {
  const startYm = monthHelper.getTwelveMonthsAgoYMD();
  const endYm = monthHelper.getCurrentMonthYMD();
  const startDate = monthHelper.monthToDate(startYm);
  const endDate = monthHelper.nextMonth(monthHelper.monthToDate(endYm));

  const [
    reportingCurrencyId,
    rates,
    { data: salaryRecords, error: salaryError },
    { data: dayExpenses, error: expensesError },
  ] = await Promise.all([
    fetchReportingCurrencyId(),
    fetchExchangeRates(),
    supabase()
      .from("salary_records")
      .select("month, net_salary, employees(currency_id)")
      .gte("month", startDate)
      .lt("month", endDate),
    supabase()
      .from("day_to_day_expenses")
      .select("date, amount, currency_id")
      .gte("date", startDate)
      .lt("date", endDate),
  ]);

  if (salaryError) throw salaryError;
  if (expensesError) throw expensesError;

  const payrollByMonth = new Map<string, number>();
  const expensesByMonth = new Map<string, number>();

  type SalaryRow = {
    month: string;
    net_salary: number;
    employees: { currency_id: string | null } | null;
  };
  const salaryListRaw = (salaryRecords ?? []) as unknown as SalaryRow[];
  for (const r of salaryListRaw) {
    const ym = r.month.slice(0, 7);
    const currencyId =
      (Array.isArray(r.employees) ? r.employees[0] : r.employees)
        ?.currency_id ?? null;
    const converted = convertToReporting(
      Number(r.net_salary),
      currencyId,
      reportingCurrencyId,
      rates,
    );
    payrollByMonth.set(ym, (payrollByMonth.get(ym) ?? 0) + converted);
  }
  type ExpenseRow = {
    date: string;
    amount: number;
    currency_id: string | null;
  };
  for (const r of (dayExpenses ?? []) as ExpenseRow[]) {
    const ym = r.date.slice(0, 7);
    const converted = convertToReporting(
      Number(r.amount),
      r.currency_id ?? null,
      reportingCurrencyId,
      rates,
    );
    expensesByMonth.set(ym, (expensesByMonth.get(ym) ?? 0) + converted);
  }

  const result: PayrollAndExpensesByMonth[] = [];
  const d = new Date(startYm + "-01");
  const end = new Date(endYm + "-01");
  while (d <= end) {
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: ym,
      label: monthHelper.formatMonth(ym),
      payroll: payrollByMonth.get(ym) ?? 0,
      expenses: expensesByMonth.get(ym) ?? 0,
    });
    d.setMonth(d.getMonth() + 1);
  }

  return result.reverse();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const currentYm = monthHelper.getCurrentMonthYMD();
  const yearStart = `${now.getFullYear()}-01-01`;
  const currentMonthStart = monthHelper.monthToDate(currentYm);
  const currentMonthEnd = monthHelper.nextMonth(currentMonthStart);

  const [
    reportingCurrencyId,
    rates,
    { data: salaryRecords },
    { data: dayExpenses },
    { data: fixedAssets },
  ] = await Promise.all([
    fetchReportingCurrencyId(),
    fetchExchangeRates(),
    supabase()
      .from("salary_records")
      .select("month, net_salary, status, employees(currency_id)")
      .gte("month", yearStart)
      .lt("month", currentMonthEnd),
    supabase()
      .from("day_to_day_expenses")
      .select("amount, currency_id")
      .gte("date", currentMonthStart)
      .lt("date", currentMonthEnd),
    supabase()
      .from("fixed_assets")
      .select("cost, currency_id")
      .eq("status", "active"),
  ]);

  type SalaryRow = {
    month: string;
    net_salary: number;
    status: string;
    employees: { currency_id: string | null } | null;
  };
  const salaryList = (salaryRecords ?? []) as unknown as SalaryRow[];
  const currentMonthRecords = salaryList.filter(
    (r) => r.month.slice(0, 7) === currentYm,
  );

  const empCurrency = (r: SalaryRow) =>
    (Array.isArray(r.employees) ? r.employees[0] : r.employees)?.currency_id ??
    null;
  const totalMonthlyPayroll = currentMonthRecords.reduce(
    (s, r) =>
      s +
      convertToReporting(
        Number(r.net_salary),
        empCurrency(r),
        reportingCurrencyId,
        rates,
      ),
    0,
  );
  const pendingSalariesCount = currentMonthRecords.filter(
    (r) => r.status === "pending",
  ).length;
  const annualPayrollYTD = salaryList.reduce(
    (s, r) =>
      s +
      convertToReporting(
        Number(r.net_salary),
        empCurrency(r),
        reportingCurrencyId,
        rates,
      ),
    0,
  );

  type ExpenseRow = { amount: number; currency_id: string | null };
  const expensesThisMonth = (dayExpenses ?? []).reduce(
    (s: number, r: ExpenseRow) =>
      s +
      convertToReporting(
        Number(r.amount),
        r.currency_id ?? null,
        reportingCurrencyId,
        rates,
      ),
    0,
  );

  type AssetRow = { cost: number; currency_id: string | null };
  const fixedAssetsTotalValue = (fixedAssets ?? []).reduce(
    (s: number, r: AssetRow) =>
      s +
      convertToReporting(
        Number(r.cost),
        r.currency_id ?? null,
        reportingCurrencyId,
        rates,
      ),
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

  const [reportingCurrencyId, rates, { data, error }] = await Promise.all([
    fetchReportingCurrencyId(),
    fetchExchangeRates(),
    supabase()
      .from("salary_records")
      .select("month, net_salary, employees(currency_id)")
      .gte("month", startDate)
      .lt("month", endDate),
  ]);

  if (error) throw error;
  type Row = {
    month: string;
    net_salary: number;
    employees: { currency_id: string | null } | null;
  };
  const list = (data ?? []) as unknown as Row[];

  const byMonth = new Map<string, number>();
  for (const r of list) {
    const ym = r.month.slice(0, 7);
    const currencyId =
      (Array.isArray(r.employees) ? r.employees[0] : r.employees)
        ?.currency_id ?? null;
    const converted = convertToReporting(
      Number(r.net_salary),
      currencyId,
      reportingCurrencyId,
      rates,
    );
    byMonth.set(ym, (byMonth.get(ym) ?? 0) + converted);
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

export function usePayrollAndExpensesByMonth() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "payrollAndExpensesByMonth"] as const,
    queryFn: fetchPayrollAndExpensesByMonth,
  });
}
