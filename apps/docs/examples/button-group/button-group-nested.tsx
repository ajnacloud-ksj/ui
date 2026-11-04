"use client";

import { Button, ButtonGroup } from "@ajnacloud/ui";

export function ButtonGroupNested() {
  return (
    <ButtonGroup aria-label="Document actions">
      <ButtonGroup aria-label="Edit">
        <Button variant="secondary">Undo</Button>
        <Button variant="secondary">Redo</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Clipboard">
        <Button variant="secondary">Copy</Button>
        <Button variant="secondary">Paste</Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
