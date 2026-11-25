"use client";

import { Button, QrCode, Spinner } from "@ajnacloud/ui";
import { useState } from "react";

export function QrCodeSpinner() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <QrCode.Root
        value="https://example.com/menu"
        size="lg"
        aria-busy={loading}
      >
        <QrCode.Frame
          aria-label="Scan to view the menu"
          className={loading ? "opacity-20" : undefined}
        />
        {loading && (
          <QrCode.Overlay>
            <Spinner aria-label="Preparing QR code" />
          </QrCode.Overlay>
        )}
      </QrCode.Root>
      <Button variant="outline" onClick={() => setLoading(!loading)}>
        {loading ? "Show QR code" : "Show loading state"}
      </Button>
    </div>
  );
}
