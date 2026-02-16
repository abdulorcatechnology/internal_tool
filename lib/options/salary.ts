import { SalaryStatus } from "@/types/salary";

const STATUS_OPTIONS: { value: SalaryStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "deferred", label: "Deferred" },
];

export default {
  STATUS_OPTIONS,
};
