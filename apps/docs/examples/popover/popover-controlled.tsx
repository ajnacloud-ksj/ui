"use client";

import { Button, Field, FieldLabel, Input, Popover } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function PopoverControlled() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Website refresh");
  const [savedName, setSavedName] = useState(name);
  const inputId = useId();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ margin: 0 }} role="status">
        Project: {savedName}
      </p>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger render={<Button variant="secondary" />}>
          Rename project
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Rename project</Popover.Title>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSavedName(name.trim());
              setOpen(false);
            }}
            style={{ display: "grid", gap: 16 }}
          >
            <Field>
              <FieldLabel htmlFor={inputId}>Project name</FieldLabel>
              <Input
                id={inputId}
                value={name}
                onValueChange={setName}
                required
              />
            </Field>
            <Button type="submit" variant="primary" disabled={!name.trim()}>
              Save name
            </Button>
          </form>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
