"use client";

import {
  Field,
  FieldError,
  Slider,
  SliderLabel,
  SliderValue,
} from "@ajnacloud/ui";
import { Field as FieldPrimitive } from "@ajnacloud/ui/primitives/field";
import { useId, useState } from "react";

export function SliderValidation() {
  const id = useId();
  const [value, setValue] = useState(40);
  const invalid = value < 50;
  return (
    <FieldPrimitive.Root invalid={invalid}>
      <Field data-invalid={invalid} style={{ maxWidth: 400 }}>
        <Slider
          value={value}
          onValueChange={setValue}
          step={5}
          aria-describedby={invalid ? id : undefined}
        >
          <SliderLabel>Minimum contribution</SliderLabel>
          <SliderValue />
        </Slider>
        {invalid && (
          <FieldError id={id}>Choose a contribution of at least 50.</FieldError>
        )}
      </Field>
    </FieldPrimitive.Root>
  );
}
