"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@ajnacloud/ui";
import { useId } from "react";

export function InputOTPBasic() {
  const id = useId();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Verification code</FieldLabel>
      <InputOTP
        id={id}
        name="code"
        length={6}
        aria-describedby={`${id}-description`}
      >
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot aria-label="Character 2" />
          <InputOTPSlot aria-label="Character 3" />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot aria-label="Character 4" />
          <InputOTPSlot aria-label="Character 5" />
          <InputOTPSlot aria-label="Character 6" />
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-description`}>
        Enter the six-digit code sent to your email.
      </FieldDescription>
    </Field>
  );
}
