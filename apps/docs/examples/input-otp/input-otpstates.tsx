"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
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
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value="000000"
          aria-invalid
          aria-describedby={`${id}-error`}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldError id={`${id}-error`}>
          This code has expired. Request a new code.
        </FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor={`${id}-disabled`}>Code unavailable</FieldLabel>
        <InputOTP id={`${id}-disabled`} maxLength={6} value="123456" disabled>
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
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
