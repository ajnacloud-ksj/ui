"use client";

import { Button, Tooltip } from "@ajnacloud/ui";

export function TooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button variant="outline" />}>
        Save draft
      </Tooltip.Trigger>
      <Tooltip.Content>
        Your changes stay private until you publish.
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
