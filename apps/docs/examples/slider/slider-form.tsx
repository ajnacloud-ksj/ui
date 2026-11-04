"use client";

import { Button, Slider, SliderLabel, SliderValue } from "@ajnacloud/ui";
import { useState } from "react";

export function SliderForm() {
  const [budget, setBudget] = useState([20, 80]);
  const [result, setResult] = useState("");
  return (
    <form
      style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}
      onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget).getAll("budget");
        setResult(`Selected budget: ${values.join(" – ")}`);
      }}
      onReset={() => {
        setBudget([20, 80]);
        setResult("");
      }}
    >
      <Slider
        name="budget"
        value={budget}
        onValueChange={setBudget}
        thumbProps={{
          getAriaLabel: (index) =>
            index === 0 ? "Minimum budget" : "Maximum budget",
        }}
      >
        <SliderLabel>Budget</SliderLabel>
        <SliderValue />
      </Slider>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Button type="submit">Apply budget</Button>
        <Button variant="secondary" type="reset">
          Reset
        </Button>
      </div>
      {result && (
        <p role="status" style={{ margin: 0 }}>
          {result}
        </p>
      )}
    </form>
  );
}
