"use client";

import { QrCode } from "@ajnacloud/ui/qr-code";

export function QrCodeFill() {
  return (
    <QrCode.Root value="https://example.com" size="lg">
      <QrCode.Frame
        aria-label="Website QR code"
        fill="#17366b"
        className="bg-white p-2"
      />
    </QrCode.Root>
  );
}
