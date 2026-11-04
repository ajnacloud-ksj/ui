"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function FieldValidation() {
  const id = useId();
  const [email, setEmail] = useState("someone@");
  const [submitted, setSubmitted] = useState(false);
  const error =
    submitted && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
      ? "Enter an email address such as you@example.com."
      : undefined;
  return (
    <form
      noValidate
      style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={id}>Email address</FieldLabel>
        <Input
          id={id}
          name="email"
          type="email"
          value={email}
          onValueChange={setEmail}
          aria-invalid={Boolean(error)}
          aria-describedby={[`${id}-help`, error && `${id}-error`]
            .filter(Boolean)
            .join(" ")}
        />
        <FieldDescription id={`${id}-help`}>
          Use an address where you can receive invitations.
        </FieldDescription>
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      </Field>
      <Button type="submit">Validate email</Button>
      {submitted && !error && (
        <p role="status" style={{ margin: 0 }}>
          The email address is valid.
        </p>
      )}
    </form>
  );
}
