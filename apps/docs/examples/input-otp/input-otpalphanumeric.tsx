"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@ajnacloud/ui";
import { useId } from "react";

export function InputOTPAlphanumeric() {
  const id = useId();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Recovery code</FieldLabel>
      <InputOTP
        id={id}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        inputMode="text"
        autoCapitalize="characters"
        pasteTransformer={(text) => text.replace(/[\s-]/g, "").toUpperCase()}
        aria-describedby={`${id}-description`}
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-description`}>
        Letters and numbers. Pasted spaces and hyphens are removed.
      </FieldDescription>
    </Field>
  );
}
