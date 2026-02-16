function formatMonthAndYear(monthStr: string) {
  const d = new Date(monthStr + "T00:00:00");
  return d.toLocaleDateString("en-PK", { month: "short", year: "numeric" });
}

/** Last 24 months for filter dropdown */
function calculateLast24Months(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ value: ym, label: formatMonthAndYear(ym) });
  }
  return out;
}

function monthToDate(ym: string): string {
  return `${ym}-01`;
}
function nextMonth(ymd: string): string {
  const d = new Date(ymd);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default {
  getMonthOptions: calculateLast24Months,
  formatMonth: formatMonthAndYear,
  monthToDate: monthToDate,
  nextMonth: nextMonth,
};
