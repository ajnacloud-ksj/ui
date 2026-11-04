"use client";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Table,
} from "@ajnacloud/ui";
import { useState } from "react";

export function TableEmptyExample() {
  const [query, setQuery] = useState("archived");
  const data = ["Website", "API", "Dashboard"];
  const rows = data.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div style={{ width: "100%", display: "grid", gap: 16 }}>
      <Input
        aria-label="Filter project table"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a project…"
      />
      <div style={{ overflowX: "auto" }}>
        <Table aria-label="Filtered projects">
          <Table.Header>
            <Table.Row>
              <Table.Head>Project</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length > 0 ? (
              rows.map((name) => (
                <Table.Row key={name}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>Active</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.EmptyRow colSpan={2}>
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle render={<h3>No matching projects</h3>} />
                    <EmptyDescription>
                      Try another name or clear your filter to see every
                      project.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="secondary" onClick={() => setQuery("")}>
                      Clear project filter
                    </Button>
                  </EmptyContent>
                </Empty>
              </Table.EmptyRow>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
