"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ajnacloud/ui";
import { useId } from "react";

export function InputOTPStates() {
  const id = useId();
  return (
    <div className="space-y-6">
      <Field data-invalid>
        <FieldLabel htmlFor={`${id}-invalid`}>Verification code</FieldLabel>
        <InputOTP
          id={`${id}-invalid`}
          length={6}
          value="000000"
          aria-invalid
          aria-describedby={`${id}-error`}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot
                key={index}
                aria-invalid
                aria-label={index === 0 ? undefined : `Character ${index + 1}`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldError id={`${id}-error`}>
          This code has expired. Request a new code.
        </FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor={`${id}-disabled`}>Code unavailable</FieldLabel>
        <InputOTP id={`${id}-disabled`} length={6} value="123456" disabled>
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot
                key={index}
                aria-label={index === 0 ? undefined : `Character ${index + 1}`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldDescription>
          Request a new code before trying again.
        </FieldDescription>
      </Field>
    </div>
  );
}
