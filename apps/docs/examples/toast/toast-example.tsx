"use client";

import { Button, toast } from "@ajnacloud/ui";

export function ToastExample() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast.add({
          title: "Event created",
          description: "Sunday, December 3 at 9:00 AM",
        })
      }
    >
      Show toast
    </Button>
  );
}
