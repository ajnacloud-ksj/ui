"use client";

import {
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";
import { useState } from "react";

export function ComboboxFooter() {
  const [requested, setRequested] = useState<string | null>(null);
  const options = Array.from({ length: 24 }, (_, index) => ({
    label: `Project ${index + 1}`,
    value: `project-${index + 1}`,
  }));
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-footer">Project</FieldLabel>
      <Combobox
        id="combo-footer"
        options={options}
        placeholder="Choose or request a project"
        footer={({ inputValue, close }) => (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs">{options.length} projects</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={!inputValue.trim()}
              onClick={() => {
                setRequested(inputValue);
                close();
              }}
            >
              Request project
            </Button>
          </div>
        )}
      />
      <FieldDescription>
        The action stays visible while results scroll and when no options match.
      </FieldDescription>
      {requested && <output className="text-sm">Requested: {requested}</output>}
    </Field>
  );
}
