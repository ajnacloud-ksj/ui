"use client";

import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  DropdownMenu,
} from "@ajnacloud/ui";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ButtonGroupSplit() {
  const [message, setMessage] = useState("");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ButtonGroup aria-label="Save options">
        <Button variant="primary" onClick={() => setMessage("Draft saved.")}>
          Save
        </Button>
        <ButtonGroupSeparator />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            render={
              <Button
                variant="primary"
                shape="square"
                aria-label="More save options"
                icon={<ChevronDown />}
              />
            }
          />
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => setMessage("Copy saved.")}>
              Save a copy
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setMessage("Template saved.")}>
              Save as template
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </ButtonGroup>
      <p role="status" style={{ margin: 0, minHeight: 20 }}>
        {message}
      </p>
    </div>
  );
}
