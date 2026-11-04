"use client";

import { Button, FilterBar } from "@ajnacloud/ui";
import { useState } from "react";

export function FilterBarExternalUpdates() {
  type Values = { archived: boolean; reference: string };
  const resetValue: Values = { archived: false, reference: "" };
  const [value, setValue] = useState(resetValue);
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full space-y-4">
      <FilterBar
        value={value}
        resetValue={resetValue}
        onValueChange={setValue}
        open={open}
        onOpenChange={setOpen}
        applyMode="staged"
        filters={[
          { id: "archived", type: "toggle", label: "Include archived" },
          {
            id: "reference",
            type: "text",
            label: "Reference",
            description: (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setValue((previous) => ({
                      ...previous,
                      archived: !previous.archived,
                    }))
                  }
                >
                  Simulate an external archive change
                </Button>
                <span className="mt-2 block">
                  Edit Reference, then use this button. Apply preserves the
                  external archive change and commits your reference.
                </span>
              </>
            ),
          },
        ]}
      />
      <p
        role="status"
        className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
      >
        Reference: {value.reference || "none"}; archived:{" "}
        {value.archived ? "included" : "excluded"}
      </p>
    </div>
  );
}
