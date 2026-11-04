"use client";

import {
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function FieldForm() {
  const id = useId();
  const [result, setResult] = useState("");
  return (
    <form
      style={{ width: "100%", maxWidth: 420 }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(`Preferences received for ${data.get("name")}.`);
      }}
    >
      <FieldSet aria-describedby={`${id}-help`}>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription id={`${id}-help`}>
          Choose the details your teammates see.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Display name</FieldLabel>
            <Input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              defaultValue="Alex Morgan"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-email`}>Work email</FieldLabel>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              required
            />
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Checkbox
              id={`${id}-updates`}
              name="updates"
              defaultChecked
              aria-describedby={`${id}-updates-help`}
            />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-updates`}>Product updates</FieldLabel>
              <FieldDescription id={`${id}-updates-help`}>
                Occasional news about new features.
              </FieldDescription>
            </FieldContent>
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" variant="primary">
              Save preferences
            </Button>
            <Button
              variant="secondary"
              type="reset"
              onClick={() => setResult("")}
            >
              Reset
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
      {result && <p role="status">{result}</p>}
    </form>
  );
}
