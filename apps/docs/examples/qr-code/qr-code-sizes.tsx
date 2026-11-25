"use client";

import { QrCode, type QrCodeSize } from "@ajnacloud/ui/qr-code";

const sizes: QrCodeSize[] = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

export function QrCodeSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <QrCode.Root value="https://example.com" size={size}>
            <QrCode.Frame aria-label={`Website QR, ${size}`} />
          </QrCode.Root>
          <span className="text-sm text-fd-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  );
}
