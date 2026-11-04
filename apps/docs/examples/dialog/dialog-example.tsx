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

export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="primary" />}>
        View project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Website redesign</DialogTitle>
          <DialogDescription>
            Review project details and upcoming milestones.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
