"use client";

import { Button } from "@ajnacloud/ui";

export function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="base">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
