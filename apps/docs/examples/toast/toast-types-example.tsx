"use client";

import { Button, toast } from "@ajnacloud/ui";

export function ToastTypesExample() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {(
        ["default", "success", "info", "warning", "error", "loading"] as const
      ).map((type) => (
        <Button
          variant="secondary"
          key={type}
          onClick={() =>
            toast.add({
              title: `${type[0]!.toUpperCase()}${type.slice(1)} notification`,
              description:
                type === "loading"
                  ? "This loading notification stays until updated or dismissed."
                  : "A short update about your workspace.",
              type: type === "default" ? undefined : type,
            })
          }
        >
          {type[0]!.toUpperCase()}
          {type.slice(1)}
        </Button>
      ))}
    </div>
  );
}
