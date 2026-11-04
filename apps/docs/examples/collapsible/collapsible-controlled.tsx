"use client";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ajnacloud/ui";
import { useState } from "react";

export function CollapsibleControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger render={<Button variant="secondary" />}>
        {open ? "Hide settings" : "Show settings"}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{ margin: 0, paddingTop: 12 }}>
          Advanced settings are available here.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
