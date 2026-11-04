"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ajnacloud/ui";

export function AccordionMultipleExample() {
  return (
    <Accordion
      multiple
      defaultValue={["accessibility"]}
      style={{ width: "100%", maxWidth: 480 }}
    >
      <AccordionItem value="accessibility">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Base UI manages trigger/panel associations and native button
          activation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="styling">
        <AccordionTrigger>Can I customize the styling?</AccordionTrigger>
        <AccordionContent>
          Use Ajna tokens, generated application utilities, or your own
          stylesheet.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>Unavailable section</AccordionTrigger>
        <AccordionContent>This section is disabled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
