"use client";

import { Field, FieldLabel, Input, QrCode } from "@ajnacloud/ui";
import { useState } from "react";

export function QrCodeInput() {
  const [value, setValue] = useState("https://example.com/menu");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <Field className="w-full">
        <FieldLabel htmlFor="qr-content">QR content</FieldLabel>
        <Input
          id="qr-content"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </Field>
      <QrCode.Root value={value} size="lg">
        <QrCode.Frame aria-label="QR code for the entered content" />
      </QrCode.Root>
    </div>
  );
}
