"use client";

import { Skeleton, Table } from "@ajnacloud/ui";

export function SkeletonTable() {
  return (
    <div style={{ width: "100%", maxWidth: 500 }}>
      <p role="status" style={{ margin: "0 0 12px" }}>
        Loading projects…
      </p>
      <Table aria-label="Projects" aria-busy="true">
        <Table.Header>
          <Table.Row>
            <Table.Head>Project</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[0, 1, 2].map((row) => (
            <Table.Row key={row}>
              <Table.Cell>
                <Skeleton style={{ width: "75%", height: 16 }} />
              </Table.Cell>
              <Table.Cell>
                <Skeleton
                  style={{ width: 64, height: 20, borderRadius: 9999 }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
