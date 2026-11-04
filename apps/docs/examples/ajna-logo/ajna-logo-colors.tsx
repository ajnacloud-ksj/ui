"use client";

import { AjnaLogo } from "@ajnacloud/ui";

export function AjnaLogoColors() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="flex min-h-40 items-center justify-center rounded-lg bg-white p-8">
        <AjnaLogo color="brand" width={240} tagline />
      </div>
      <div className="flex min-h-40 items-center justify-center rounded-lg bg-ajna-brand-navy p-8">
        <AjnaLogo color="white" width={240} tagline />
      </div>
    </div>
  );
}
