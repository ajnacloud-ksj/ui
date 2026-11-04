"use client";

import { Slider, SliderLabel, SliderValue } from "@ajnacloud/ui";

export function SliderDisabled() {
  return (
    <Slider disabled defaultValue={60} style={{ maxWidth: 400 }}>
      <SliderLabel>Managed volume</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
