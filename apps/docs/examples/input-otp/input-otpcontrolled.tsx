"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function InputOTPControlled() {
  const id = useId();
  const [value, setValue] = useState("");
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor={id}>Security code</FieldLabel>
      <InputOTP
        id={id}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={setValue}
        aria-describedby={`${id}-value`}
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id={`${id}-value`}>
        {value ? `Entered: ${value}` : "Enter your one-time password."}
      </FieldDescription>
      <Button
        variant="outline"
        size="sm"
        disabled={!value}
        onClick={() => setValue("")}
        className="w-fit"
      >
        Clear
      </Button>
    </Field>
  );
}
