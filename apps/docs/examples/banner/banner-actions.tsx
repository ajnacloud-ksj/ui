"use client";

import { Banner, Button } from "@ajnacloud/ui";
import { useState } from "react";

export function BannerActions() {
  const [visible, setVisible] = useState(true);
  return visible ? (
    <Banner
      variant="success"
      size="sm"
      title="Changes saved"
      description="Your project is up to date."
      action={
        <Banner.Action variant="ghost" onClick={() => setVisible(false)}>
          Dismiss
        </Banner.Action>
      }
    />
  ) : (
    <Button variant="secondary" onClick={() => setVisible(true)}>
      Show banner
    </Button>
  );
}
