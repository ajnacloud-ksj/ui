"use client";

import { Button, toast } from "@ajnacloud/ui";

export function ToastTimeoutExample() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({ title: "Link copied", type: "success", timeout: 2000 })
        }
      >
        Two-second notification
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            id: "docs-persistent-notice",
            title: "Review requested",
            description: "This notification stays until you dismiss it.",
            timeout: 0,
          })
        }
      >
        Persistent notification
      </Button>
    </div>
  );
}
