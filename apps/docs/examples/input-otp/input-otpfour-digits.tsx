"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@ajnacloud/ui";
import { useId } from "react";

export function InputOTPFourDigits() {
  const id = useId();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Four-digit PIN</FieldLabel>
      <InputOTP id={id} maxLength={4} pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription>
        Use the code provided by your authenticator.
      </FieldDescription>
    </Field>
  );
}
