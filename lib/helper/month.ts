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

export default {
  getMonthOptions: calculateLast24Months,
  formatMonth: formatMonthAndYear,
};
