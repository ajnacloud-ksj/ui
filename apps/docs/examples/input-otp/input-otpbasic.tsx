"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
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
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        aria-describedby={`${id}-description`}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-description`}>
        Enter the six-digit code sent to your email.
      </FieldDescription>
    </Field>
  );
}
