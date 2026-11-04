"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ajnacloud/ui";
import { useId } from "react";

export function InputOTPAlphanumeric() {
  const id = useId();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Recovery code</FieldLabel>
      <InputOTP
        id={id}
        length={6}
        inputMode="text"
        validationType="alphanumeric"
        normalizeValue={(value) => value.toUpperCase()}
        aria-describedby={`${id}-description`}
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={index === 0 ? undefined : `Character ${index + 1}`}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-description`}>
        Letters and numbers. Codes are converted to uppercase.
      </FieldDescription>
    </Field>
  );
}
