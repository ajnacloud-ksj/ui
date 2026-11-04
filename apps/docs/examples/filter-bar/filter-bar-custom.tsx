"use client";

import {
  FilterBar,
  type FilterBarDefinition,
  Input,
  Select,
} from "@ajnacloud/ui";
import { Mail } from "lucide-react";
import { useState } from "react";

export function FilterBarCustom() {
  type Match = { operator: "contains" | "equals"; text: string };
  type Values = { email: Match };
  const resetValue: Values = { email: { operator: "contains", text: "" } };
  const [value, setValue] = useState(resetValue);
  const filters: FilterBarDefinition<Values>[] = [
    {
      id: "email",
      type: "custom",
      label: "Customer email",
      icon: <Mail />,
      description:
        "This application owns the comparison choices and their meaning.",
      isEqual: (left, right) =>
        left.operator === right.operator && left.text === right.text,
      isActive: (current) => current.text.trim().length > 0,
      getActiveLabel: (current) => `Email ${current.operator} ${current.text}`,
      validate: (current) =>
        current.text.length > 80 ? "Use no more than 80 characters." : null,
      render: ({
        value: current,
        onValueChange,
        id,
        labelId,
        describedBy,
        disabled,
        error,
        popupContainer,
      }) => (
        <div role="group" aria-labelledby={labelId} className="space-y-2">
          <Select
            value={current.operator}
            options={[
              { label: "Contains", value: "contains" },
              { label: "Equals", value: "equals" },
            ]}
            onValueChange={(operator) => {
              if (operator === "contains" || operator === "equals")
                onValueChange({ ...current, operator });
            }}
            disabled={disabled}
            aria-label="Email comparison"
            contentProps={{
              container: popupContainer,
              alignItemWithTrigger: false,
            }}
          />
          <Input
            id={id}
            value={current.text}
            onChange={(event) =>
              onValueChange({ ...current, text: event.currentTarget.value })
            }
            disabled={disabled}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error) || undefined}
            placeholder="example.com"
          />
        </div>
      ),
    },
  ];
  return (
    <div className="w-full space-y-4">
      <FilterBar
        filters={filters}
        value={value}
        resetValue={resetValue}
        onValueChange={setValue}
        applyMode="staged"
      />
      <p className="text-sm text-[hsl(var(--ajna-muted-foreground))]">
        Comparison: {value.email.operator}; text: {value.email.text || "empty"}
      </p>
    </div>
  );
}
