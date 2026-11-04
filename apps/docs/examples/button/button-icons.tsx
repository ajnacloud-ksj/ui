"use client";

import { Button } from "@ajnacloud/ui";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

export function ButtonIcons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={<Plus />}>Add member</Button>
      <Button>
        Continue
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
      <Button
        variant="secondary"
        shape="square"
        icon={<Trash2 />}
        aria-label="Delete item"
      />
      <Button shape="circle" icon={<Plus />} aria-label="Add item" />
    </div>
  );
}
