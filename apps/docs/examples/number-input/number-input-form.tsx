"use client";

import { Button, Field, FieldLabel, NumberInput } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function NumberInputForm() {
  const id = useId();
  const [result, setResult] = useState("");
  const [quantity, setQuantity] = useState<number | null>(3);
  return (
    <form
      style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}
      onReset={() => {
        setQuantity(3);
        setResult("");
      }}
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          `Submitted quantity: ${new FormData(event.currentTarget).get("quantity")}`,
        );
      }}
    >
      <Field>
        <FieldLabel htmlFor={id}>Order quantity</FieldLabel>
        <NumberInput
          id={id}
          name="quantity"
          value={quantity}
          onValueChange={setQuantity}
          min={1}
          max={20}
          step={1}
          required
          showControls
          incrementLabel="Add one item"
          decrementLabel="Remove one item"
        />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <Button type="submit" variant="primary">
          Submit order
        </Button>
        <Button variant="secondary" type="reset">
          Reset quantity
        </Button>
      </div>
      <span role="status">{result}</span>
    </form>
  );
}
