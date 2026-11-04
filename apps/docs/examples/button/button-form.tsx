"use client";

import { Button, Field, FieldLabel, Input } from "@ajnacloud/ui";
import { type FormEvent, useId, useState } from "react";

export function ButtonForm() {
  const nameId = useId();
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMessage(`Submitted project: ${String(data.get("projectName"))}.`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <Field>
        <FieldLabel htmlFor={nameId}>Project name</FieldLabel>
        <Input
          id={nameId}
          name="projectName"
          placeholder="Website redesign"
          required
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">
          Create project
        </Button>
        <Button variant="secondary" type="reset" onClick={() => setMessage("")}>
          Reset
        </Button>
      </div>
      <p role="status" className="min-h-6 text-sm">
        {message}
      </p>
    </form>
  );
}
