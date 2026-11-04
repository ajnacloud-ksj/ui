"use client";

import { Slider, SliderLabel, SliderValue } from "@ajnacloud/ui";

export function SliderSteps() {
  return (
    <Slider
      defaultValue={1}
      min={0.5}
      max={2}
      step={0.25}
      largeStep={0.5}
      thumbProps={{
        getAriaValueText: (_, value) => `${value} times normal speed`,
      }}
      style={{ maxWidth: 400 }}
    >
      <SliderLabel>Playback speed</SliderLabel>
      <SliderValue>{(_, values) => `${values[0]}×`}</SliderValue>
    </Slider>
  );
}
