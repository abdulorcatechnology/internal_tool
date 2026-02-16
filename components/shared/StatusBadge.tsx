"use client";

import { cn } from "@/lib/utils";

type StatusBadgeVariant = "success" | "warning" | "muted";

const variantClasses: Record<StatusBadgeVariant, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  muted: "bg-muted text-muted-foreground",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({
  variant,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
