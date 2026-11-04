"use client";

import { Table, type TableSortDirection } from "@ajnacloud/ui";
import { useState } from "react";

export function TableSortingExample() {
  const data = [
    { id: "website", name: "Website", members: 4 },
    { id: "api", name: "API", members: 12 },
    { id: "dashboard", name: "Dashboard", members: 8 },
  ];
  const [sort, setSort] = useState<{
    key: "name" | "members";
    direction: TableSortDirection;
  }>({ key: "name", direction: false });
  const rows = sort.direction
    ? [...data].sort((a, b) => {
        const result =
          sort.key === "name"
            ? a.name.localeCompare(b.name)
            : a.members - b.members;
        return sort.direction === "asc" ? result : -result;
      })
    : data;
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table>
        <Table.Caption>
          Projects. Activate a column heading to sort ascending, descending,
          then restore the original order.
        </Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.SortHead
              sortDirection={sort.key === "name" ? sort.direction : false}
              onSortChange={(direction) => setSort({ key: "name", direction })}
            >
              Project
            </Table.SortHead>
            <Table.SortHead
              sortDirection={sort.key === "members" ? sort.direction : false}
              onSortChange={(direction) =>
                setSort({ key: "members", direction })
              }
              style={{ textAlign: "right" }}
            >
              Members
            </Table.SortHead>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.name}</Table.Cell>
              <Table.Cell style={{ textAlign: "right" }}>
                {row.members}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
