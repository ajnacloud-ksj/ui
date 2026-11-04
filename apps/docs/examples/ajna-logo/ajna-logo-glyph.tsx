"use client";

import { AjnaLogo } from "@ajnacloud/ui";

export function AjnaLogoGlyph() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex min-h-28 w-36 items-center justify-center rounded-lg bg-white p-6">
        <AjnaLogo
          variant="glyph"
          color="brand"
          width={64}
          aria-label="Ajna navy glyph"
        />
      </div>
      <div className="flex min-h-28 w-36 items-center justify-center rounded-lg bg-ajna-brand-navy p-6 text-ajna-brand-orange">
        <AjnaLogo
          variant="glyph"
          color="current"
          width={64}
          aria-label="Ajna orange glyph"
        />
      </div>
      <div className="flex min-h-28 w-36 items-center justify-center rounded-lg bg-ajna-brand-navy p-6">
        <AjnaLogo
          variant="glyph"
          color="white"
          width={64}
          aria-label="Ajna white glyph"
        />
      </div>
    </div>
  );
}
