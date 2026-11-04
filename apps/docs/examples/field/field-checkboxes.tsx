"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldCheckboxes() {
  const id = useId();
  return (
    <FieldSet style={{ maxWidth: 400 }} aria-describedby={`${id}-help`}>
      <FieldLegend variant="label">Email notifications</FieldLegend>
      <FieldDescription id={`${id}-help`}>
        Choose which updates reach your inbox.
      </FieldDescription>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id={`${id}-mentions`} name="mentions" defaultChecked />
          <FieldLabel htmlFor={`${id}-mentions`}>
            Mentions and replies
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id={`${id}-digest`}
            name="digest"
            aria-describedby={`${id}-digest-help`}
          />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-digest`}>Weekly summary</FieldLabel>
            <FieldDescription id={`${id}-digest-help`}>
              A roundup of activity every Monday.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
