"use client";

import { Toggle } from "@ajnacloud/ui";
import { Bookmark } from "lucide-react";
import { useState } from "react";

export function ToggleControlled() {
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 12 }}>
      <Toggle
        variant="outline"
        pressed={bookmarked}
        onPressedChange={setBookmarked}
      >
        <Bookmark aria-hidden="true" />
        Bookmark
      </Toggle>
      <span>
        {bookmarked
          ? "This project is in your bookmarks."
          : "This project is not bookmarked."}
      </span>
    </div>
  );
}
