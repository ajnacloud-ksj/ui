"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
  Button,
  Checkbox,
} from "@ajnacloud/ui";
import { useId, useRef, useState } from "react";

export function ActionBarExample() {
  const id = useId();
  const reset = useRef<HTMLButtonElement>(null);
  const [documents, setDocuments] = useState([
    "Weekly report",
    "Client invoice",
    "Project roadmap",
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 440 }}>
      <div style={{ display: "grid", gap: 12 }}>
        {documents.map((name, index) => (
          <label
            key={name}
            htmlFor={`${id}-${index}`}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <Checkbox
              id={`${id}-${index}`}
              checked={selected.includes(name)}
              onCheckedChange={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, name]
                    : current.filter((item) => item !== name),
                )
              }
            />
            {name}
          </label>
        ))}
        {documents.length === 0 && (
          <p style={{ margin: 0 }}>All documents archived.</p>
        )}
      </div>
      <Button
        variant="secondary"
        ref={reset}
        onClick={() => {
          setDocuments(["Weekly report", "Client invoice", "Project roadmap"]);
          setSelected([]);
          setMessage("");
        }}
      >
        Reset documents
      </Button>
      <span role="status">
        {message || "Select documents to show their actions."}
      </span>
      <ActionBar
        open={selected.length > 0}
        onOpenChange={(open) => {
          if (!open) setSelected([]);
        }}
        aria-label="Document selection actions"
      >
        <ActionBarSelection>{selected.length} selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup aria-label="Document actions">
          <ActionBarItem
            onSelect={() => setSelected(documents)}
            disabled={selected.length === documents.length}
          >
            Select all
          </ActionBarItem>
          <ActionBarItem
            onSelect={() => {
              setDocuments((current) =>
                current.filter((name) => !selected.includes(name)),
              );
              setMessage(`Archived ${selected.length} document(s).`);
              setSelected([]);
              reset.current?.focus();
            }}
          >
            Archive
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose aria-label="Clear document selection" />
      </ActionBar>
    </div>
  );
}
