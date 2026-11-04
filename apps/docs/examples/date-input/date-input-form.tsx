"use client";

import {
  Button,
  DateInput,
  Field,
  FieldDescription,
  FieldTitle,
} from "@ajnacloud/ui";
import { parseDate } from "@internationalized/date";
import { useId, useState } from "react";

export function DateInputForm() {
  const [submitted, setSubmitted] = useState("");
  const id = useId();
  return (
    <form
      style={{ display: "grid", gap: 16, maxWidth: 320 }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(
          String(new FormData(event.currentTarget).get("departure")),
        );
      }}
    >
      <Field>
        <FieldTitle id={id}>Departure date</FieldTitle>
        <DateInput
          aria-labelledby={id}
          locale="en-GB"
          name="departure"
          isRequired
          defaultValue={parseDate("2026-04-12")}
          minValue={parseDate("2026-04-01")}
          maxValue={parseDate("2026-12-31")}
          clearable
        />
        <FieldDescription>
          Choose a date from April through December 2026.
        </FieldDescription>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Button type="submit">Submit</Button>
        <Button variant="secondary" type="reset">
          Reset
        </Button>
      </div>
      {submitted && <p role="status">Submitted date: {submitted}</p>}
    </form>
  );
}
