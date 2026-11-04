"use client";

import { Field, FieldLabel, Input } from "@ajnacloud/ui";
import { useId } from "react";

export function FieldContextualHelp() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 400 }}>
      <FieldLabel
        htmlFor={id}
        required
        contextualHelp={
          <>
            <p style={{ margin: 0 }}>
              Use your <strong>company email address</strong> so your teammates
              can find you.
            </p>
            <p style={{ margin: 0 }}>
              We send invitations and account recovery messages to this address.
            </p>
          </>
        }
        contextualHelpLabel="Help with work email"
      >
        Work email
      </FieldLabel>
      <Input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
      />
    </Field>
  );
}
