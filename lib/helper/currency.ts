function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

/** Format number with currency code (e.g. "USD 1,000"). Use for dashboard when reporting currency is set. */
function formatWithCode(n: number, code: string | null | undefined): string {
  if (code) return `${code} ${formatAmount(n)}`;
  return formatCurrency(n);
}

export default { formatCurrency, formatAmount, formatWithCode };
