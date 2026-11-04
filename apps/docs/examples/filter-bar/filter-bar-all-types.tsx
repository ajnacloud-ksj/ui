"use client";

import {
  FilterBar,
  type FilterBarDateRange,
  type FilterBarNumberRange,
} from "@ajnacloud/ui";
import { type DateValue, parseDate } from "@internationalized/date";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

export function FilterBarAllTypes() {
  type Values = {
    archived: boolean;
    status: string | null;
    categories: string[];
    reference: string;
    price: FilterBarNumberRange;
    delivery: DateValue | null;
    created: FilterBarDateRange;
  };
  const resetValue: Values = {
    archived: false,
    status: null,
    categories: [],
    reference: "",
    price: { min: null, max: null },
    delivery: null,
    created: { start: null, end: null },
  };
  const [value, setValue] = useState(resetValue);
  const [updates, setUpdates] = useState(0);
  return (
    <div className="w-full space-y-4">
      <FilterBar
        applyMode="staged"
        locale="en-US"
        value={value}
        resetValue={resetValue}
        onValueChange={(next) => {
          setValue(next);
          setUpdates((previous) => previous + 1);
        }}
        filters={[
          {
            id: "archived",
            type: "toggle",
            label: "Include archived",
            description: "Include items that are no longer listed.",
          },
          {
            id: "status",
            type: "select",
            label: "Status",
            options: [
              { label: "Available", value: "available", count: 24 },
              { label: "Reserved", value: "reserved", count: 8 },
              { label: "Sold out", value: "sold-out", disabled: true },
            ],
          },
          {
            id: "categories",
            type: "multi-select",
            label: "Categories",
            options: [
              { label: "Indoor", value: "indoor", count: 18 },
              { label: "Outdoor", value: "outdoor", count: 14 },
              { label: "Accessories", value: "accessories", count: 0 },
            ],
          },
          {
            id: "reference",
            type: "text",
            label: "Reference",
            placeholder: "e.g. INV-2026",
            description: "Your application decides how this text is matched.",
          },
          {
            id: "price",
            type: "number-range",
            label: "Price",
            numberProps: {
              min: 0,
              step: 0.01,
              format: { style: "currency", currency: "USD" },
            },
          },
          {
            id: "delivery",
            type: "date",
            label: "Delivery date",
            icon: <CalendarDays />,
            dateProps: { minValue: parseDate("2026-01-01") },
          },
          {
            id: "created",
            type: "date-range",
            label: "Created",
            description: "Either date may be left empty.",
          },
        ]}
      />
      <p
        role="status"
        className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
      >
        Committed updates: {updates}
      </p>
      <pre className="max-h-64 overflow-auto rounded-md bg-[hsl(var(--ajna-muted))] p-3 text-xs">
        {JSON.stringify(
          {
            ...value,
            delivery: value.delivery?.toString() ?? null,
            created: {
              start: value.created.start?.toString() ?? null,
              end: value.created.end?.toString() ?? null,
            },
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
