"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ajnacloud/ui";
import { useState } from "react";

export function AccordionControlled() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Accordion
      value={value}
      onValueChange={setValue}
      style={{ width: "100%", maxWidth: 480 }}
    >
      <AccordionItem value="details">
        <AccordionTrigger>Project details</AccordionTrigger>
        <AccordionContent>
          Additional settings for this workspace.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
