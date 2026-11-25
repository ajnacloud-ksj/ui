"use client";

import { Button, QrCode, useQrCode } from "@ajnacloud/ui";

export function QrCodeStore() {
  const qrCode = useQrCode({ defaultValue: "https://example.com/menu" });

  return (
    <div className="flex flex-col items-center gap-4">
      <QrCode.RootProvider value={qrCode} size="lg">
        <QrCode.Frame aria-label="Scan to open the selected page" />
      </QrCode.RootProvider>
      <Button
        variant="outline"
        onClick={() => qrCode.setValue("https://example.com/contact")}
      >
        Use contact page
      </Button>
      <p className="m-0 text-sm break-all text-fd-muted-foreground">
        {qrCode.value}
      </p>
    </div>
  );
}
