"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function InputOTPForm() {
  const id = useId();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [complete, setComplete] = useState(false);
  const invalid = submitted && value.length !== 6;
  return (
    <form
      className="max-w-sm space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (value.length === 6) setComplete(true);
      }}
    >
      <Field data-invalid={invalid || undefined}>
        <FieldLabel htmlFor={id} required>
          Verification code
        </FieldLabel>
        <InputOTP
          id={id}
          name="code"
          required
          length={6}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            setComplete(false);
          }}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : `${id}-description`}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot
                aria-invalid={invalid || undefined}
                key={index}
                aria-label={index === 0 ? undefined : `Character ${index + 1}`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {invalid ? (
          <FieldError id={`${id}-error`}>Enter all six digits.</FieldError>
        ) : (
          <FieldDescription id={`${id}-description`}>
            Enter the code sent to your email address.
          </FieldDescription>
        )}
      </Field>
      <Button type="submit">Verify code</Button>
      {complete && (
        <p
          role="status"
          className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
        >
          Code captured. Your application verifies it with the server.
        </p>
      )}
    </form>
  );
}
