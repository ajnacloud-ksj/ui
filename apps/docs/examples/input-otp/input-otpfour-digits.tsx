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

export function InputOTPFourDigits() {
  const id = useId();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Four-digit PIN</FieldLabel>
      <InputOTP id={id} length={4}>
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={index === 0 ? undefined : `Character ${index + 1}`}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription>
        Use the code provided by your authenticator.
      </FieldDescription>
    </Field>
  );
}
