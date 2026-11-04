"use client";

import { Button, ButtonGroup, ButtonGroupSeparator } from "@ajnacloud/ui";

export function ButtonGroupDividers() {
  return (
    <ButtonGroup aria-label="Document actions">
      <Button variant="primary">Save</Button>
      <ButtonGroupSeparator />
      <Button variant="primary">Save a copy</Button>
    </ButtonGroup>
  );
}
