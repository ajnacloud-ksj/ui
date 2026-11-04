"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
  Button,
} from "@ajnacloud/ui";
import { useEffect, useState } from "react";

export function ActionBarAsync() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(
    "Select the example records to begin.",
  );
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setPending(false);
      setOpen(false);
      setMessage("Archived the two example records.");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => {
          setMessage("Two example records selected.");
          setOpen(true);
        }}
      >
        Select two example records
      </Button>
      <span role="status">{message}</span>
      <ActionBar
        open={open}
        onOpenChange={setOpen}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        aria-label="Async record actions"
      >
        <ActionBarSelection>2 selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup aria-label="Record actions">
          <ActionBarItem
            variant="primary"
            loading={pending}
            onSelect={() => {
              setPending(true);
              setMessage("Archiving example records…");
            }}
          >
            Archive records
          </ActionBarItem>
          <ActionBarItem disabled>Export unavailable</ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose disabled={pending} />
      </ActionBar>
    </div>
  );
}
