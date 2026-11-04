"use client";

import { AjnaLogo } from "@ajnacloud/ui";

export function AjnaLogoLink() {
  return (
    <a
      href="/"
      aria-label="Ajna home"
      className="inline-flex items-center gap-3 rounded-sm text-inherit outline-offset-4 focus-visible:outline-2"
    >
      <AjnaLogo variant="glyph" color="current" width={32} aria-hidden />
      <span className="text-lg font-semibold">Ajna</span>
    </a>
  );
}
