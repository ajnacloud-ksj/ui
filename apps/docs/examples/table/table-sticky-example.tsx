"use client";

import { Button, Table } from "@ajnacloud/ui";
import { Eye } from "lucide-react";
import { useState } from "react";

export function TableStickyExample() {
  const [opened, setOpened] = useState("");
  const rows = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Project ${index + 1}`,
  }));
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <div
        tabIndex={0}
        role="region"
        aria-label="Scrollable project inventory"
        style={{
          overflow: "auto",
          maxHeight: 230,
          border: "1px solid hsl(var(--ajna-border))",
          borderRadius: 8,
        }}
      >
        <Table aria-label="Project inventory" style={{ minWidth: 900 }}>
          <Table.Header variant="compact" sticky>
            <Table.Row>
              <Table.Head sticky="left">Project</Table.Head>
              <Table.Head>Owner</Table.Head>
              <Table.Head>Environment</Table.Head>
              <Table.Head>Updated</Table.Head>
              <Table.Head sticky="right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                variant={row.id === 3 ? "selected" : "default"}
              >
                <Table.Cell sticky="left" style={{ whiteSpace: "nowrap" }}>
                  {row.name}
                </Table.Cell>
                <Table.Cell>Alex Morgan</Table.Cell>
                <Table.Cell>Production</Table.Cell>
                <Table.Cell>Today, 10:30 AM</Table.Cell>
                <Table.Cell sticky="right">
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label={`View ${row.name}`}
                    onClick={() => setOpened(row.name)}
                  >
                    <Eye aria-hidden="true" size={16} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <span role="status">{opened ? `Opened ${opened}.` : ""}</span>
    </div>
  );
}
