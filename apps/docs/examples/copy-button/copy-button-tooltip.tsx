"use client";

import { CopyButton, Tooltip } from "@ajnacloud/ui";

export function CopyButtonTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <CopyButton value="project_123" copyLabel="Copy project ID" />
          }
        />
        <Tooltip.Content>Copy project ID</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
