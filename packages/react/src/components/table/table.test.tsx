import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { Table, type TableSortDirection } from ".";

it("names the table through Caption and renders an EmptyRow as one spanning native cell", () => {
  const caption = createRef<HTMLTableCaptionElement>();
  const row = createRef<HTMLTableRowElement>();
  render(
    <Table>
      <Table.Caption ref={caption}>Filtered projects</Table.Caption>
      <Table.Body>
        <Table.EmptyRow
          ref={row}
          colSpan={3}
          cellProps={{
            "aria-describedby": "empty-help",
            style: { padding: 24 },
          }}
        >
          <p id="empty-help">No projects match this filter.</p>
        </Table.EmptyRow>
      </Table.Body>
    </Table>,
  );
  expect(screen.getByRole("table", { name: "Filtered projects" })).toBeTruthy();
  expect(caption.current?.tagName).toBe("CAPTION");
  expect(row.current).toBe(screen.getByRole("row"));
  const cell = screen.getByRole("cell");
  expect(cell.getAttribute("colspan")).toBe("3");
  expect(cell.getAttribute("aria-describedby")).toBe("empty-help");
  expect(cell.style.padding).toBe("24px");
  expect(row.current?.children).toHaveLength(1);
});

it("keeps native table semantics, cell spans, scoped headers, and forwarded refs", () => {
  const table = createRef<HTMLTableElement>();
  const head = createRef<HTMLTableCellElement>();
  const cell = createRef<HTMLTableCellElement>();
  render(
    <Table ref={table} layout="fixed">
      <caption>Project costs</caption>
      <Table.Header variant="compact" sticky>
        <Table.Row>
          <Table.Head ref={head} sticky="left">
            Project
          </Table.Head>
          <Table.Head>Cost</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row variant="selected" aria-selected="true">
          <Table.Cell ref={cell} sticky="left">
            Website
          </Table.Cell>
          <Table.Cell>$20</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={2}>Total $20</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>,
  );
  expect(table.current).toBe(
    screen.getByRole("table", { name: "Project costs" }),
  );
  expect(head.current).toBe(
    screen.getByRole("columnheader", { name: "Project" }),
  );
  expect(head.current?.getAttribute("scope")).toBe("col");
  expect(cell.current).toBe(screen.getByRole("cell", { name: "Website" }));
  expect(
    screen.getByRole("cell", { name: "Total $20" }).getAttribute("colspan"),
  ).toBe("2");
});

it("lets application selection state drive indeterminate and selected rows", async () => {
  const change = vi.fn();
  function Example() {
    const [selected, setSelected] = useState<string[]>(["Website"]);
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.CheckHead
              label="Select all projects"
              checked={selected.length === 2}
              indeterminate={selected.length === 1}
              onCheckedChange={(checked, details) => {
                change(checked, details);
                setSelected(checked ? ["Website", "API"] : []);
              }}
            />
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {["Website", "API"].map((name) => (
            <Table.Row
              key={name}
              variant={selected.includes(name) ? "selected" : "default"}
            >
              <Table.CheckCell
                label={`Select ${name}`}
                checked={selected.includes(name)}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked
                      ? [...selected, name]
                      : selected.filter((value) => value !== name),
                  )
                }
              />
              <Table.Cell>{name}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
  render(<Example />);
  const all = screen.getByRole("checkbox", { name: "Select all projects" });
  expect(all.getAttribute("aria-checked")).toBe("mixed");
  await userEvent.click(all);
  expect(change.mock.calls[0]?.[0]).toBe(true);
  expect(change.mock.calls[0]?.[1]).toBeTruthy();
  for (const name of ["Website", "API"])
    expect(
      screen
        .getByRole("checkbox", { name: `Select ${name}` })
        .getAttribute("aria-checked"),
    ).toBe("true");
  await userEvent.click(all);
  expect(all.getAttribute("aria-checked")).toBe("false");
});

it("preserves checkbox disabled state, cancellation, and the upstream callback alias", async () => {
  const alias = vi.fn();
  const disabled = vi.fn();
  render(
    <Table>
      <Table.Body>
        <Table.Row>
          <Table.CheckCell
            label="Cancel selection"
            onCheckedChange={(_, details) => details.cancel()}
          />
          <Table.CheckCell label="Legacy selection" onValueChange={alias} />
          <Table.CheckCell
            label="Disabled selection"
            disabled
            onCheckedChange={disabled}
          />
        </Table.Row>
      </Table.Body>
    </Table>,
  );
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Cancel selection" }),
  );
  expect(
    screen
      .getByRole("checkbox", { name: "Cancel selection" })
      .getAttribute("aria-checked"),
  ).toBe("false");
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Legacy selection" }),
  );
  expect(alias).toHaveBeenCalledWith(true);
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Disabled selection" }),
  );
  expect(disabled).not.toHaveBeenCalled();
});

it("cycles requested sort directions with ARIA state on the header and a real button", async () => {
  const ref = createRef<HTMLTableCellElement>();
  const buttonRef = createRef<HTMLButtonElement>();
  const change = vi.fn();
  function Example() {
    const [direction, setDirection] = useState<TableSortDirection>(false);
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.SortHead
              ref={ref}
              buttonProps={{ ref: buttonRef }}
              sortDirection={direction}
              onSortChange={(next, event) => {
                change(next, event.shiftKey);
                setDirection(next);
              }}
            >
              Project
            </Table.SortHead>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>
    );
  }
  render(<Example />);
  const user = userEvent.setup();
  const button = screen.getByRole("button", { name: "Project" });
  expect(buttonRef.current).toBe(button);
  expect(ref.current).toBe(
    screen.getByRole("columnheader", { name: "Project" }),
  );
  expect(ref.current?.getAttribute("aria-sort")).toBe("none");
  expect(button.hasAttribute("aria-sort")).toBe(false);
  await user.tab();
  await user.keyboard("{Enter}");
  expect(ref.current?.getAttribute("aria-sort")).toBe("ascending");
  await user.keyboard(" ");
  expect(ref.current?.getAttribute("aria-sort")).toBe("descending");
  await user.keyboard("{Shift>}");
  await user.click(button);
  await user.keyboard("{/Shift}");
  expect(change.mock.calls.map((call) => call[0])).toEqual([
    "asc",
    "desc",
    false,
  ]);
  expect(change.mock.calls[2]?.[1]).toBe(true);
  expect(ref.current?.getAttribute("aria-sort")).toBe("none");
  expect(
    screen
      .getByRole("columnheader", { name: "Status" })
      .hasAttribute("aria-sort"),
  ).toBe(false);
});

it("keeps resize and sort controls as siblings and preserves disabled and multisort annotations", async () => {
  const sort = vi.fn();
  const resize = vi.fn();
  render(
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.SortHead
            sortDirection="desc"
            sortPriority={2}
            aria-sort={undefined}
            onSortChange={sort}
            disabled
            resizeHandle={
              <Table.ResizeHandle
                aria-label="Resize project"
                onClick={resize}
              />
            }
          >
            Project
          </Table.SortHead>
        </Table.Row>
      </Table.Header>
    </Table>,
  );
  const head = screen.getByRole("columnheader");
  expect(head.hasAttribute("aria-sort")).toBe(false);
  expect(within(head).getAllByRole("button")).toHaveLength(2);
  expect(
    screen
      .getByRole("button", { name: "Project Sort priority 2" })
      .querySelector("button"),
  ).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Project Sort priority 2" }),
  );
  expect(sort).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Resize project" }));
  expect(resize).toHaveBeenCalledOnce();
});

it("keeps sort state controlled and does not submit forms from header controls", async () => {
  const sort = vi.fn();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.SortHead sortDirection={false} onSortChange={sort}>
              Project
            </Table.SortHead>
            <Table.Head>
              Actions
              <Table.ResizeHandle aria-label="Resize actions" />
            </Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>
    </form>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Project" }));
  expect(sort.mock.calls[0]?.[0]).toBe("asc");
  expect(
    screen
      .getByRole("columnheader", { name: "Project" })
      .getAttribute("aria-sort"),
  ).toBe("none");
  await userEvent.click(screen.getByRole("button", { name: "Resize actions" }));
  expect(submit).not.toHaveBeenCalled();
});
