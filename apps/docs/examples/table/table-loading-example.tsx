"use client";

import { Button, Skeleton, Table } from "@ajnacloud/ui";
import { useState } from "react";

export function TableLoadingExample() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <Button variant="secondary" onClick={() => setLoading(!loading)}>
        {loading ? "Finish loading" : "Reload"}
      </Button>
      <div style={{ overflowX: "auto" }}>
        <Table aria-label="Loading projects" aria-busy={loading}>
          <Table.Header>
            <Table.Row>
              <Table.Head>Project</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              [0, 1, 2].map((index) => (
                <Table.Row key={index} aria-hidden="true">
                  <Table.Cell>
                    <Skeleton style={{ width: 160, height: 20 }} />
                  </Table.Cell>
                  <Table.Cell>
                    <Skeleton style={{ width: 80, height: 20 }} />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell>Website</Table.Cell>
                <Table.Cell>Active</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      <span role="status">
        {loading ? "Loading projects…" : "Projects loaded."}
      </span>
    </div>
  );
}
