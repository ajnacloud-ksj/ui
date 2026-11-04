"use client";

import { Button } from "@ajnacloud/ui";

export function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">View details</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="destructive">Delete project</Button>
      <Button variant="secondary-destructive">Remove member</Button>
    </div>
  );
}
