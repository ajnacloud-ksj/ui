"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldChoiceCards() {
  const id = useId();
  return (
    <FieldSet style={{ maxWidth: 400 }}>
      <FieldLegend variant="label" id={`${id}-legend`}>
        Project visibility
      </FieldLegend>
      <RadioGroup
        name="visibility"
        defaultValue="private"
        aria-labelledby={`${id}-legend`}
      >
        {[
          {
            value: "private",
            title: "Private",
            description: "Only invited teammates can open this project.",
          },
          {
            value: "workspace",
            title: "Workspace",
            description: "Everyone in your workspace can find this project.",
          },
        ].map((option) => (
          <FieldLabel key={option.value}>
            <Field orientation="horizontal">
              <RadioGroupItem
                value={option.value}
                aria-labelledby={`${id}-${option.value}-title`}
                aria-describedby={`${id}-${option.value}-help`}
              />
              <FieldContent>
                <FieldTitle id={`${id}-${option.value}-title`}>
                  {option.title}
                </FieldTitle>
                <FieldDescription id={`${id}-${option.value}-help`}>
                  {option.description}
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
