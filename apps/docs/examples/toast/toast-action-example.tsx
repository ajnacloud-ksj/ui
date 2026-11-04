"use client";

import { Button, toast } from "@ajnacloud/ui";
import { useRef, useState } from "react";

export function ToastActionExample() {
  const [created, setCreated] = useState(false);
  const notice = useRef<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Button
          variant="secondary"
          disabled={created}
          onClick={() => {
            setCreated(true);
            const id = toast.add({
              title: "Event created",
              description: "The event was added to your calendar.",
              actionProps: {
                children: "Undo",
                onClick: () => {
                  if (notice.current === id) {
                    setCreated(false);
                    notice.current = null;
                  }
                  toast.close(id);
                },
              },
            });
            notice.current = id;
          }}
        >
          Create event
        </Button>
        {created && (
          <Button
            variant="secondary"
            onClick={() => {
              if (notice.current) toast.close(notice.current);
              notice.current = null;
              setCreated(false);
            }}
          >
            Reset calendar
          </Button>
        )}
      </div>
      <span>
        {created
          ? "One event in the calendar."
          : "Your calendar has no events."}
      </span>
    </div>
  );
}
