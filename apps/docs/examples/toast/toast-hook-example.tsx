"use client";

import { Button, useToastManager } from "@ajnacloud/ui";

export function ToastHookExample() {
  const manager = useToastManager();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        manager.add({
          title: "Settings saved",
          description: "This message belongs to the surrounding Toaster.",
          type: "success",
        })
      }
    >
      Notify through the hook
    </Button>
  );
}
