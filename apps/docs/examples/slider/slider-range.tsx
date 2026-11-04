"use client";

import { Slider, SliderLabel, SliderValue } from "@ajnacloud/ui";

export function SliderRange() {
  return (
    <Slider
      defaultValue={[20, 80]}
      minStepsBetweenValues={5}
      thumbCollisionBehavior="none"
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      thumbProps={{
        getAriaLabel: (index) =>
          index === 0 ? "Minimum budget" : "Maximum budget",
      }}
      style={{ maxWidth: 400 }}
    >
      <SliderLabel>Budget range</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
