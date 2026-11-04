"use client";

import { Button, createToastManager, Toaster } from "@ajnacloud/ui";
import { useState } from "react";

export function ToastRichColorsExample() {
  const [manager] = useState(() => createToastManager());
  return (
    <Toaster richColors toastManager={manager}>
      <div className="flex flex-wrap gap-3">
        {(["success", "info", "warning", "error"] as const).map((type) => (
          <Button
            variant="secondary"
            key={type}
            onClick={() =>
              manager.add({
                title: `${type.charAt(0).toUpperCase()}${type.slice(1)} notification`,
                description: "A notification with semantic colors.",
                type,
              })
            }
          >
            {type.charAt(0).toUpperCase()}
            {type.slice(1)}
          </Button>
        ))}
      </div>
    </Toaster>
  );
}
