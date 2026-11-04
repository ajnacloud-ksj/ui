"use client";

import { buttonVariants } from "@ajnacloud/ui";

export function ButtonLink() {
  return (
    <a
      href="/docs/installation"
      className={buttonVariants({ variant: "outline" })}
      data-ajna-component="button"
    >
      Installation guide
    </a>
  );
}
