"use client";

import { Banner } from "@ajnacloud/ui";
import { Info } from "lucide-react";

export function BannerExample() {
  return (
    <Banner
      title="Update available"
      icon={<Info />}
      description="A new version is ready to install."
      action={<Banner.Action>Update</Banner.Action>}
    />
  );
}
