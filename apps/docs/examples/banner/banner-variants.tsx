"use client";

import { Banner, type BannerVariant } from "@ajnacloud/ui";
import {
  Bell,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";

export function BannerVariants() {
  const icons = {
    info: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    destructive: CircleAlert,
    neutral: Bell,
  };
  return (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      {(
        [
          "info",
          "success",
          "warning",
          "destructive",
          "neutral",
        ] as BannerVariant[]
      ).map((variant) => {
        const Icon = icons[variant];
        return (
          <Banner
            key={variant}
            variant={variant}
            icon={<Icon />}
            title={variant}
            description="A message with a dedicated status color and background."
          />
        );
      })}
    </div>
  );
}
