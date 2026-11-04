"use client";

import { Toggle } from "@ajnacloud/ui";
import { Bookmark, Italic } from "lucide-react";

export function ToggleOutline() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Toggle variant="outline" aria-label="Italic">
        <Italic aria-hidden="true" />
      </Toggle>
      <Toggle variant="outline">
        <Bookmark aria-hidden="true" />
        Bookmark
      </Toggle>
    </div>
  );
}
