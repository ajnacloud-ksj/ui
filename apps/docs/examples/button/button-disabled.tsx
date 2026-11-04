"use client";

import { Button } from "@ajnacloud/ui";
import { Plus } from "lucide-react";

export function ButtonDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" disabled>
        Publish
      </Button>
      <Button variant="secondary" disabled>
        Unavailable
      </Button>
      <Button
        variant="secondary"
        shape="square"
        icon={<Plus />}
        aria-label="Add item"
        disabled
      />
    </div>
  );
}
