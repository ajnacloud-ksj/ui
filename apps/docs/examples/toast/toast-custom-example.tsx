"use client";

import {
  Button,
  createToastManager,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "@ajnacloud/ui";
import { useState } from "react";

function ProjectToastList() {
  const { toasts } = useToastManager<{ project: string }>();
  return toasts.map((item) => (
    <Toast
      key={item.id}
      toast={item}
      swipeDirection={["left", "down"]}
      style={(state) => ({
        borderColor:
          state.type === "success" ? "hsl(var(--ajna-success))" : undefined,
      })}
    >
      <ToastContent>
        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 4 }}>
          <ToastTitle />
          <ToastDescription />
          <code style={{ fontSize: 12 }}>{item.data?.project}</code>
        </div>
        <ToastAction />
        <ToastClose aria-label="Dismiss project notification" />
      </ToastContent>
    </Toast>
  ));
}

export function ToastCustomExample() {
  const [manager] = useState(() => createToastManager<{ project: string }>());
  return (
    <ToastProvider toastManager={manager} timeout={0} limit={2}>
      <Button
        variant="secondary"
        onClick={() =>
          manager.add({
            title: "Export ready",
            description: "The CSV file is available.",
            type: "success",
            data: { project: "Website" },
          })
        }
      >
        Show custom project notification
      </Button>
      <ToastPortal>
        <ToastViewport
          aria-label="Project notifications"
          style={{
            left: 16,
            right: "auto",
            margin: 0,
            width: "calc(100vw - 2rem)",
            maxWidth: 320,
          }}
        >
          <ProjectToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
