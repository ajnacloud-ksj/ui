"use client";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ajnacloud/ui";

export function CollapsibleExample() {
  return (
    <Collapsible style={{ width: "100%", maxWidth: 400 }}>
      <CollapsibleTrigger render={<Button variant="secondary" />}>
        Project details
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{ margin: 0, paddingTop: 12 }}>
          Keep repository settings, environment variables, and deployment notes
          in one place.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
