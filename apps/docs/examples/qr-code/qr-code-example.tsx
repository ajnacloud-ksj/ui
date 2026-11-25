"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  QrCode,
} from "@ajnacloud/ui";
import { Download } from "lucide-react";

export function QrCodeExample() {
  return (
    <Card style={{ width: "100%", maxWidth: 320 }}>
      <CardHeader>
        <CardTitle>Our menu</CardTitle>
        <CardDescription>
          Scan with your camera to view today's menu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QrCode.Root
          value="https://example.com/menu"
          size="xl"
          className="mx-auto flex flex-col items-center gap-4"
        >
          <QrCode.Frame
            aria-label="Scan to view the menu"
            className="bg-white text-black"
          />
          <QrCode.DownloadTrigger
            fileName="menu-qr.png"
            mimeType="image/png"
            render={<Button variant="outline" />}
          >
            <Download aria-hidden="true" /> Download QR
          </QrCode.DownloadTrigger>
        </QrCode.Root>
      </CardContent>
      <CardFooter>
        <a
          href="https://example.com/menu"
          className="text-sm underline underline-offset-4"
        >
          Open the menu
        </a>
      </CardFooter>
    </Card>
  );
}
