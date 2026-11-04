"use client";

import { Button, toast } from "@ajnacloud/ui";

export function ToastPriorityExample() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast.add({
          title: "Server connection lost",
          description:
            "Your changes have not been sent. Keep this page open while you reconnect.",
          type: "error",
          priority: "high",
          timeout: 0,
        })
      }
    >
      Show urgent notification
    </Button>
  );
}
