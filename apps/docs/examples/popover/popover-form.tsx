"use client";

import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Popover,
} from "@ajnacloud/ui";
import { useId } from "react";

export function PopoverForm() {
  const nameId = useId();
  const slugId = useId();
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" />}>
        Project settings
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Project settings</Popover.Title>
          <Popover.Description>
            Update the details shown to your team.
          </Popover.Description>
        </Popover.Header>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <Input id={nameId} defaultValue="Website refresh" />
          </Field>
          <Field>
            <FieldLabel htmlFor={slugId}>Project URL</FieldLabel>
            <Input id={slugId} defaultValue="website-refresh" />
          </Field>
        </FieldGroup>
        <Popover.Close render={<Button variant="secondary" />}>
          Done
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  );
}
