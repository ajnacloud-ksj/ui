"use client";

import { Button, Field, FieldLabel, Input, Popover } from "@ajnacloud/ui";
import { useId, useRef } from "react";

export function PopoverInitialFocus() {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="secondary" />}>
        Invite teammate
      </Popover.Trigger>
      <Popover.Content initialFocus={inputRef}>
        <Popover.Title>Invite a teammate</Popover.Title>
        <Popover.Description>Enter their work email.</Popover.Description>
        <Field>
          <FieldLabel htmlFor={inputId}>Email</FieldLabel>
          <Input
            ref={inputRef}
            id={inputId}
            type="email"
            placeholder="you@example.com"
          />
        </Field>
        <Popover.Close render={<Button variant="secondary" />}>
          Cancel
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  );
}
