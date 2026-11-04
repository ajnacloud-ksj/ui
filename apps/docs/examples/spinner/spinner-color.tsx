"use client";

import { Spinner } from "@ajnacloud/ui";

export function SpinnerColor() {
  return (
    <Spinner
      size={20}
      style={{ color: "hsl(var(--ajna-primary))" }}
      aria-label="Loading projects"
    />
  );
}
