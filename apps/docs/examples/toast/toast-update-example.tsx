"use client";

import { Button, toast } from "@ajnacloud/ui";
import { useRef, useState } from "react";

export function ToastUpdateExample() {
  const id = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button
        variant="secondary"
        disabled={active}
        onClick={() => {
          id.current = toast.add({
            id: "docs-export",
            title: "Preparing export",
            type: "loading",
            onClose: () => {
              id.current = null;
              setActive(false);
            },
          });
          setActive(true);
        }}
      >
        Start export
      </Button>
      <Button
        variant="secondary"
        disabled={!active}
        onClick={() => {
          if (id.current)
            toast.update(id.current, {
              title: "Export ready",
              description: "Your file is ready to download.",
              type: "success",
              timeout: 5000,
            });
        }}
      >
        Finish export
      </Button>
      <Button
        variant="secondary"
        disabled={!active}
        onClick={() => {
          if (id.current) toast.close(id.current);
        }}
      >
        Dismiss export
      </Button>
    </div>
  );
}
