"use client";

import { AjnaLogo } from "@ajnacloud/ui";

export function AjnaLogoVariants() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <AjnaLogo variant="glyph" color="current" width={56} />
      <AjnaLogo variant="full" color="current" width={180} />
      <AjnaLogo variant="stacked" color="current" width={120} />
    </div>
  );
}
