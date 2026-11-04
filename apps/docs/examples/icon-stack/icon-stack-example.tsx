"use client";

import { IconStack } from "@ajnacloud/ui";
import { Inbox } from "lucide-react";

export function IconStackExample() {
  return (
    <IconStack aria-hidden="true">
      <Inbox className="size-4" />
    </IconStack>
  );
}
