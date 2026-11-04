"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ajnacloud/ui";

export function DialogSizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {(["sm", "base", "lg", "xl"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger render={<Button variant="secondary" />}>
            {size} dialog
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Project overview</DialogTitle>
              <DialogDescription>
                Choose a width that fits the content.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
