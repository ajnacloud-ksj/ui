"use client";

import { Table } from "@ajnacloud/ui";
import { useState } from "react";

export function TableSelectionExample() {
  const rows = [
    { id: "website", name: "Website", locked: false },
    { id: "api", name: "API", locked: false },
    { id: "archive", name: "Archive", locked: true },
  ];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const eligible = rows.filter((row) => !row.locked);
  const all =
    eligible.length > 0 && eligible.every((row) => selected.has(row.id));
  const some = eligible.some((row) => selected.has(row.id));
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <div style={{ overflowX: "auto" }}>
        <Table aria-label="Selectable projects">
          <Table.Header variant="compact">
            <Table.Row>
              <Table.CheckHead
                label="Select all available projects"
                checked={all}
                indeterminate={some && !all}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked
                      ? new Set(eligible.map((row) => row.id))
                      : new Set(),
                  )
                }
              />
              <Table.Head>Project</Table.Head>
              <Table.Head>Selection</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                variant={selected.has(row.id) ? "selected" : "default"}
              >
                <Table.CheckCell
                  label={`Select ${row.name}`}
                  checked={selected.has(row.id)}
                  disabled={row.locked}
                  onCheckedChange={(checked) =>
                    setSelected((current) => {
                      const next = new Set(current);
                      if (checked) next.add(row.id);
                      else next.delete(row.id);
                      return next;
                    })
                  }
                />
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>
                  {row.locked
                    ? "Locked"
                    : selected.has(row.id)
                      ? "Selected"
                      : "Not selected"}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <span>
        {selected.size} of {eligible.length} available projects selected.
      </span>
    </div>
  );
}
