"use client";

import { Button, Tooltip } from "@ajnacloud/ui";
import { Plus } from "lucide-react";

export function TooltipIconExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="secondary"
            shape="square"
            aria-label="Create project"
            icon={<Plus />}
          />
        }
      />
      <Tooltip.Content>Create project</Tooltip.Content>
    </Tooltip.Root>
  );
}
