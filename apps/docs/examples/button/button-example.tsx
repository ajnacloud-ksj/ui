"use client";

import { Button } from "@ajnacloud/ui";
import { Plus } from "lucide-react";

export function ButtonExample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" icon={<Plus />}>
        Create project
      </Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
