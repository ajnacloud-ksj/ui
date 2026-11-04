"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  PasswordInput,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function PasswordInputControlled() {
  const id = useId();
  const [value, setValue] = useState("");
  return (
    <Field style={{ maxWidth: 360 }}>
      <FieldLabel htmlFor={id}>Account password</FieldLabel>
      <PasswordInput
        id={id}
        value={value}
        onValueChange={setValue}
        autoComplete="current-password"
        showPasswordLabel="Reveal account password"
        hidePasswordLabel="Conceal account password"
      />
      <FieldDescription>{value.length} characters entered.</FieldDescription>
    </Field>
  );
}
