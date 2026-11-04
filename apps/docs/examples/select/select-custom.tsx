"use client";

import { Field, FieldDescription, FieldLabel, Select } from "@ajnacloud/ui";
import { BriefcaseBusiness } from "lucide-react";
import { useState } from "react";

export function SelectCustom() {
  const plans = [
    { id: 0, name: "Personal", detail: "For your own projects" },
    { id: 1, name: "Team", detail: "For a shared workspace" },
    { id: 2, name: "Business", detail: "For larger organizations" },
  ];
  const [value, setValue] = useState<number | null>(0);
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-plan">Plan</FieldLabel>
      <Select
        id="select-plan"
        options={plans}
        getLabel={(plan) => plan.name}
        getValue={(plan) => plan.id}
        value={value}
        onValueChange={setValue}
        renderOption={(plan) => (
          <>
            <BriefcaseBusiness size={16} aria-hidden="true" />
            <span className="flex flex-col">
              <span>{plan.name}</span>
              <span className="text-xs opacity-70">{plan.detail}</span>
            </span>
          </>
        )}
        contentProps={{ alignItemWithTrigger: false }}
      />
      <FieldDescription>
        The selected value is the numeric plan ID, including zero.
      </FieldDescription>
    </Field>
  );
}
