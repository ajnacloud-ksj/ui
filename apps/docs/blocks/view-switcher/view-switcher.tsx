"use client";

import { Button, ButtonGroup } from "@ajnacloud/ui";
import { LayoutGrid, Table2 } from "lucide-react";

export type ViewSwitcherValue = "table" | "grid";

export interface ViewSwitcherProps {
  value: ViewSwitcherValue;
  onValueChange: (value: ViewSwitcherValue) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function ViewSwitcher({
  value,
  onValueChange,
  disabled = false,
  className,
  "aria-label": label = "Content view",
}: ViewSwitcherProps) {
  return (
    <ButtonGroup aria-label={label} className={className}>
      {(
        [
          { value: "table", label: "Table view", icon: <Table2 /> },
          { value: "grid", label: "Grid view", icon: <LayoutGrid /> },
        ] as const
      ).map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "secondary" : "outline"}
          shape="square"
          aria-label={option.label}
          aria-pressed={value === option.value}
          disabled={disabled}
          icon={option.icon}
          onClick={() => {
            if (option.value !== value) onValueChange(option.value);
          }}
        />
      ))}
    </ButtonGroup>
  );
}
