"use client";

import { Slider, SliderLabel, SliderValue } from "@ajnacloud/ui";
import { useState } from "react";

export function SliderControlled() {
  const [value, setValue] = useState(40);
  const [committed, setCommitted] = useState(40);
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Slider
        value={value}
        onValueChange={setValue}
        onValueCommitted={setCommitted}
        step={5}
        thumbProps={{ getAriaValueText: (_, next) => `${next} percent` }}
      >
        <SliderLabel>Volume</SliderLabel>
        <SliderValue>{(_, values) => `${values[0]}%`}</SliderValue>
      </Slider>
      <p style={{ marginBottom: 0 }}>Last committed: {committed}%</p>
    </div>
  );
}
