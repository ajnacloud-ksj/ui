"use client";

import { Kbd, KbdGroup } from "@ajnacloud/ui";

export function KbdCombination() {
  return (
    <p style={{ margin: 0 }}>
      Press{" "}
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span aria-hidden="true">+</span>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to open search.
    </p>
  );
}
