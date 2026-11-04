"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
  Button,
  DropdownMenu,
} from "@ajnacloud/ui";
import { Archive, Copy, Ellipsis } from "lucide-react";
import { useState } from "react";

export function ActionBarMenu() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "Choose an action for the example files.",
  );
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Select example files
      </Button>
      <span role="status">{message}</span>
      <ActionBar
        open={open}
        onOpenChange={setOpen}
        aria-label="Example file actions"
      >
        <ActionBarSelection>2 selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup aria-label="File actions">
          <ActionBarItem
            icon={<Archive />}
            onSelect={() => {
              setMessage("Archived two example files.");
              setOpen(false);
            }}
          >
            Archive files
          </ActionBarItem>
          <DropdownMenu.Root>
            <ActionBarItem
              render={<DropdownMenu.Trigger />}
              shape="square"
              aria-label="More file actions"
              icon={<Ellipsis />}
            />
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onClick={() => {
                  setMessage("Duplicated two example files.");
                  setOpen(false);
                }}
              >
                <Copy aria-hidden="true" />
                Duplicate files
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </ActionBarGroup>
        <ActionBarClose />
      </ActionBar>
    </div>
  );
}
