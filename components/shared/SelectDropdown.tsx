import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SelectDropdown = ({
  label,
  options,
  value,
  onChange,
}: SelectDropdownProps) => {
  return (
    <>
      <Label className="text-muted-foreground whitespace-nowrap text-sm">
        {label}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectDropdown;
