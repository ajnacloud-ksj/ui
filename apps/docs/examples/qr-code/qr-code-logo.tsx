"use client";

import { AjnaLogo, QrCode } from "@ajnacloud/ui";

export function QrCodeLogo() {
  return (
    <QrCode.Root
      value="https://example.com/workspace"
      size="xl"
      encoding={{ ecc: "H" }}
    >
      <QrCode.Frame aria-label="Scan to open the workspace" />
      <QrCode.Overlay>
        <AjnaLogo
          variant="glyph"
          color="current"
          aria-hidden="true"
          className="h-full w-full"
        />
      </QrCode.Overlay>
    </QrCode.Root>
  );
}
