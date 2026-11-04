"use client";

import {
  ActionBar,
  type ActionBarAlign,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  type ActionBarOrientation,
  ActionBarSelection,
  ActionBarSeparator,
  type ActionBarSide,
  Button,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function ActionBarPosition() {
  const id = useId();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);
  const [side, setSide] = useState<ActionBarSide>("bottom");
  const [align, setAlign] = useState<ActionBarAlign>("center");
  const [orientation, setOrientation] =
    useState<ActionBarOrientation>("horizontal");
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <label htmlFor={`${id}-side`}>
          Side{" "}
          <select
            id={`${id}-side`}
            value={side}
            onChange={(event) => setSide(event.target.value as ActionBarSide)}
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>
        <label htmlFor={`${id}-align`}>
          Align{" "}
          <select
            id={`${id}-align`}
            value={align}
            onChange={(event) => setAlign(event.target.value as ActionBarAlign)}
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </label>
        <label htmlFor={`${id}-orientation`}>
          Orientation{" "}
          <select
            id={`${id}-orientation`}
            value={orientation}
            onChange={(event) =>
              setOrientation(event.target.value as ActionBarOrientation)
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Show positioned actions
      </Button>
      <div
        ref={setHost}
        style={{
          position: "relative",
          isolation: "isolate",
          minHeight: 260,
          border: "1px dashed hsl(var(--ajna-border))",
          borderRadius: 8,
        }}
      >
        <ActionBar
          open={Boolean(host) && open}
          onOpenChange={setOpen}
          portalContainer={host}
          side={side}
          align={align}
          orientation={orientation}
          style={{ position: "absolute" }}
          aria-label="Positioned actions"
        >
          <ActionBarSelection>3 selected</ActionBarSelection>
          <ActionBarSeparator />
          <ActionBarGroup aria-label="Available actions">
            <ActionBarItem>Review</ActionBarItem>
            <ActionBarItem disabled>Publish</ActionBarItem>
          </ActionBarGroup>
          <ActionBarClose />
        </ActionBar>
      </div>
    </div>
  );
}
