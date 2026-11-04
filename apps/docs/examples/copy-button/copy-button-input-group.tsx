"use client";

import {
  CopyButton,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@ajnacloud/ui";

export function CopyButtonInputGroup() {
  return (
    <InputGroup style={{ maxWidth: 420 }}>
      <InputGroupInput
        aria-label="Invitation link"
        value="https://example.com/invite/ajna"
        readOnly
      />
      <InputGroupAddon align="inline-end">
        <CopyButton
          value="https://example.com/invite/ajna"
          size="sm"
          copyLabel="Copy invitation link"
        />
      </InputGroupAddon>
    </InputGroup>
  );
}
