"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
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
        length={6}
        value={value}
        onValueChange={setValue}
        aria-describedby={`${id}-value`}
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
