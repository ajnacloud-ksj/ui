"use client";

import { Button } from "@ajnacloud/ui";
import { Plus, Trash2 } from "lucide-react";

export function IconExample() {
  return (
    <div className="example-row">
      <Button variant="primary" icon={<Plus />}>
        Create project
      </Button>
      <Button
        variant="secondary"
        shape="square"
        aria-label="Delete project"
        icon={<Trash2 />}
      />
    </div>
  );
}
