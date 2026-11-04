"use client";

import {
  Field,
  FieldDescription,
  Slider,
  SliderLabel,
  SliderValue,
} from "@ajnacloud/ui";
import { useId } from "react";

export function SliderFieldExample() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 400 }}>
      <Slider
        name="notification-volume"
        defaultValue={40}
        step={5}
        aria-describedby={id}
        thumbProps={{ getAriaValueText: (_, value) => `${value} percent` }}
      >
        <SliderLabel>Notification volume</SliderLabel>
        <SliderValue>{(_, values) => `${values[0]}%`}</SliderValue>
      </Slider>
      <FieldDescription id={id}>
        Choose a level for notification sounds.
      </FieldDescription>
    </Field>
  );
}
