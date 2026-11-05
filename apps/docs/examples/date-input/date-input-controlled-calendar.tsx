"use client";

import { Button, DateInput, Field, FieldTitle } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function DateInputControlledCalendar() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldTitle id={id}>Publish date</FieldTitle>
      <DateInput
        aria-labelledby={id}
        locale="en-GB"
        defaultValue="2026-04-12"
        isOpen={open}
        onOpenChange={setOpen}
      />
      <Button variant="outline" onClick={() => setOpen(true)}>
        Choose publish date
      </Button>
    </Field>
  );
}
