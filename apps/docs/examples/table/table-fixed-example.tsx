"use client";

import { Table } from "@ajnacloud/ui";

export function TableFixedExample() {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table
        layout="fixed"
        aria-label="Project storage"
        style={{ minWidth: 480 }}
      >
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
        </colgroup>
        <Table.Header>
          <Table.Row>
            <Table.Head>Project</Table.Head>
            <Table.Head>Files</Table.Head>
            <Table.Head style={{ textAlign: "right" }}>Storage</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <div
                title="Website redesign and design-system migration"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Website redesign and design-system migration
              </div>
            </Table.Cell>
            <Table.Cell>24</Table.Cell>
            <Table.Cell style={{ textAlign: "right" }}>2.4 GB</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>API</Table.Cell>
            <Table.Cell>12</Table.Cell>
            <Table.Cell style={{ textAlign: "right" }}>1.1 GB</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={2}>Total storage</Table.Cell>
            <Table.Cell style={{ textAlign: "right" }}>3.5 GB</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  );
}
