"use client";

import { Button, ButtonGroup, Input } from "@ajnacloud/ui";
import { useState } from "react";

export function ButtonGroupWithInput() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <ButtonGroup aria-label="Project search" style={{ width: "100%" }}>
        <Input
          aria-label="Project name"
          value={value}
          onValueChange={setValue}
          placeholder="Project name"
        />
        <Button variant="secondary" onClick={() => setValue("")}>
          Clear
        </Button>
      </ButtonGroup>
    </div>
  );
}
