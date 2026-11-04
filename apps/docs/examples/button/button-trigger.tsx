"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ajnacloud/ui";

export function ButtonTrigger() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        View project
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Website redesign</DialogTitle>
        <DialogDescription>
          Review the project details before making changes.
        </DialogDescription>
        <div className="mt-6 flex justify-end">
          <DialogClose render={<Button variant="secondary" />}>
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
