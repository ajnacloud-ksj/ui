"use client";

import { Button, Input, Kbd, KbdGroup, Tooltip } from "@ajnacloud/ui";
import { useRef } from "react";

export function KbdSearch() {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      role="search"
      aria-label="Project search shortcut"
      style={{ display: "grid", gap: 16, width: "100%", maxWidth: 360 }}
      onKeyDown={(event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          input.current?.focus();
        }
      }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Button
              variant="secondary"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => input.current?.focus()}
            />
          }
        >
          Search projects{" "}
          <KbdGroup aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Focus search{" "}
          <KbdGroup aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Tooltip.Content>
      </Tooltip.Root>
      <Input
        ref={input}
        aria-label="Find a project"
        placeholder="Find a project…"
      />
    </div>
  );
}
