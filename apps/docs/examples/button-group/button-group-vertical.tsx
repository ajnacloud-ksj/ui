"use client";

import { Button, ButtonGroup, ButtonGroupText } from "@ajnacloud/ui";
import { useState } from "react";

export function ButtonGroupVertical() {
  const [zoom, setZoom] = useState(100);
  return (
    <ButtonGroup orientation="vertical" aria-label="Zoom">
      <Button variant="secondary" onClick={() => setZoom(zoom + 10)}>
        Zoom in
      </Button>
      <ButtonGroupText aria-live="polite">{zoom}%</ButtonGroupText>
      <Button
        variant="secondary"
        onClick={() => setZoom(Math.max(10, zoom - 10))}
      >
        Zoom out
      </Button>
    </ButtonGroup>
  );
}
