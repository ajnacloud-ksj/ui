"use client";

import { Button, QrCode } from "@ajnacloud/ui";

export function QrCodeDownload() {
  return (
    <QrCode.Root
      value="PMG:L:12345"
      size="lg"
      className="flex flex-col items-center gap-4"
    >
      <QrCode.Frame
        aria-label="Plant label PMG:L:12345"
        className="bg-white text-black"
      />
      <div className="flex gap-2">
        <QrCode.DownloadTrigger
          fileName="plant-label.png"
          mimeType="image/png"
          render={<Button variant="outline" />}
        >
          PNG
        </QrCode.DownloadTrigger>
        <QrCode.DownloadTrigger
          fileName="plant-label.svg"
          mimeType="image/svg+xml"
          render={<Button variant="outline" />}
        >
          SVG
        </QrCode.DownloadTrigger>
      </div>
    </QrCode.Root>
  );
}
