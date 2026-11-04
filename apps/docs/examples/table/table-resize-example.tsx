"use client";

import { Table, type TableSortDirection } from "@ajnacloud/ui";
import { useId, useRef, useState } from "react";

export function TableResizeExample() {
  const [width, setWidth] = useState(200);
  const [direction, setDirection] = useState<TableSortDirection>(false);
  const drag = useRef<{
    x: number;
    width: number;
  } | null>(null);
  const helpId = useId();
  const data = [
    { name: "Website", members: 4 },
    { name: "API", members: 12 },
  ];
  const rows = direction
    ? [...data].sort((a, b) =>
        direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      )
    : data;
  const clamp = (next: number) => Math.min(360, Math.max(120, next));
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <div style={{ overflowX: "auto" }}>
        <Table
          layout="fixed"
          aria-label="Resizable projects"
          style={{ minWidth: 480 }}
        >
          <colgroup>
            <col style={{ width }} />
            <col />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.SortHead
                sortDirection={direction}
                onSortChange={setDirection}
                resizeHandle={
                  <Table.ResizeHandle
                    aria-label="Resize project column"
                    aria-describedby={helpId}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.preventDefault();
                      event.currentTarget.focus();
                      drag.current = { x: event.clientX, width };
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (drag.current)
                        setWidth(
                          clamp(
                            drag.current.width + event.clientX - drag.current.x,
                          ),
                        );
                    }}
                    onPointerUp={(event) => {
                      drag.current = null;
                      if (
                        event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        event.currentTarget.releasePointerCapture(
                          event.pointerId,
                        );
                    }}
                    onPointerCancel={() => {
                      drag.current = null;
                    }}
                    onLostPointerCapture={() => {
                      drag.current = null;
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowRight"
                      ) {
                        event.preventDefault();
                        setWidth((current) =>
                          clamp(
                            current + (event.key === "ArrowRight" ? 10 : -10),
                          ),
                        );
                      } else if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setWidth(200);
                      }
                    }}
                  />
                }
              >
                Project
              </Table.SortHead>
              <Table.Head>Members</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.name}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.members}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <p id={helpId} style={{ margin: 0, fontSize: 14 }}>
        Project column: {width}px. Drag the handle or focus it and use
        Left/Right to resize. Enter or Space resets it.
      </p>
    </div>
  );
}
