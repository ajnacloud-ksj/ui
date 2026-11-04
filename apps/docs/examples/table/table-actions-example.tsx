"use client";

import { Badge, Button, DropdownMenu, Table } from "@ajnacloud/ui";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function TableActionsExample() {
  const [message, setMessage] = useState("");
  const rows = [
    { id: "website", name: "Website", status: "Active" },
    { id: "api", name: "API", status: "Draft" },
  ];
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <div style={{ overflowX: "auto" }}>
        <Table aria-label="Project actions">
          <Table.Header>
            <Table.Row>
              <Table.Head>Project</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head style={{ textAlign: "right" }}>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={row.status === "Active" ? "default" : "secondary"}
                  >
                    {row.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell style={{ textAlign: "right" }}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                      render={
                        <Button
                          variant="ghost"
                          shape="square"
                          size="sm"
                          aria-label={`Actions for ${row.name}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden="true" size={16} />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item
                        onClick={() => setMessage(`Renaming ${row.name}.`)}
                      >
                        Rename
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => setMessage(`Duplicated ${row.name}.`)}
                      >
                        Duplicate
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <span role="status">{message}</span>
    </div>
  );
}
