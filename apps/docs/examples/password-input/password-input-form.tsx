"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  PasswordInput,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function PasswordInputForm() {
  const id = useId();
  const [message, setMessage] = useState("");
  return (
    <form
      style={{ display: "grid", gap: 16, width: "100%", maxWidth: 360 }}
      onReset={() => setMessage("")}
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(
          new FormData(event.currentTarget).get("password")
            ? "Password received. This example does not send it anywhere."
            : "Enter a password.",
        );
      }}
    >
      <Field>
        <FieldLabel htmlFor={id}>Create a password</FieldLabel>
        <PasswordInput
          id={id}
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby={`${id}-help`}
        />
        <FieldDescription id={`${id}-help`}>
          Use at least eight characters for this example.
        </FieldDescription>
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <Button type="submit" variant="primary">
          Continue
        </Button>
        <Button variant="secondary" type="reset">
          Reset password
        </Button>
      </div>
      <span role="status">{message}</span>
    </form>
  );
}
