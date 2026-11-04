"use client";

import { Slider } from "@ajnacloud/ui";

export function SliderExample() {
  return (
    <Slider defaultValue={40} aria-label="Volume" style={{ maxWidth: 400 }} />
  );
}
