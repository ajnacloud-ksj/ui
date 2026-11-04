"use client";

import { Spinner } from "@ajnacloud/ui";

export function SpinnerSizes() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Spinner size="sm" aria-label="Small loading indicator" />
      <Spinner size="base" aria-label="Default loading indicator" />
      <Spinner size="lg" aria-label="Large loading indicator" />
      <Spinner size={40} aria-label="Custom loading indicator" />
    </div>
  );
}
