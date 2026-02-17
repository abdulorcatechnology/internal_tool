"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useId } from "react";

interface SelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export default function SelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
  triggerClassName = "w-[140px]",
}: SelectDropdownProps) {
  const id = useId();

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <Label
        htmlFor={id}
        className="text-muted-foreground whitespace-nowrap text-sm"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
