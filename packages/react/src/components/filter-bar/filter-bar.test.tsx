import { type CalendarDate, parseDate } from "@internationalized/date";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Button } from "@/components/button";
import { Input } from "@/components/input";

import {
  FilterBar,
  type FilterBarDateRange,
  type FilterBarDefinition,
  type FilterBarNumberRange,
  type FilterBarProps,
} from ".";

let mobile = false;
const mediaListeners = new Set<() => void>();
const animationsDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "getAnimations",
);
beforeEach(() => {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
  mobile = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query.includes("767px") && mobile;
      },
      media: query,
      addEventListener: (_: string, callback: () => void) =>
        mediaListeners.add(callback),
      removeEventListener: (_: string, callback: () => void) =>
        mediaListeners.delete(callback),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  if (animationsDescriptor)
    Object.defineProperty(
      Element.prototype,
      "getAnimations",
      animationsDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "getAnimations");
  vi.unstubAllGlobals();
  mediaListeners.clear();
});
interface Values {
  status: string | null;
  owners: number[];
  archived: boolean;
  email: string;
  price: FilterBarNumberRange;
  delivery: CalendarDate | null;
  created: FilterBarDateRange<CalendarDate>;
  custom: { text: string };
  page: number;
}
const resetValue: Values = {
  status: null,
  owners: [],
  archived: false,
  email: "",
  price: { min: null, max: null },
  delivery: null,
  created: { start: null, end: null },
  custom: { text: "" },
  page: 1,
};
const filters: FilterBarDefinition<Values>[] = [
  {
    id: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Paused", value: "paused", disabled: true },
    ],
  },
  {
    id: "owners",
    type: "multi-select",
    label: "Owners",
    options: [
      { value: 0, label: "Alex", count: 0 },
      { value: 1, label: "Sam" },
    ],
  },
  { id: "archived", type: "toggle", label: "Include archived" },
  { id: "email", type: "text", label: "Email" },
  { id: "price", type: "number-range", label: "Price" },
  {
    id: "delivery",
    type: "date",
    label: "Delivery",
    dateProps: { hideCalendar: true },
  },
  {
    id: "created",
    type: "date-range",
    label: "Created",
    dateProps: { hideCalendar: true },
  },
  {
    id: "custom",
    type: "custom",
    label: "Custom",
    isEqual: (left, right) => left.text === right.text,
    getActiveLabel: (value) => `Custom: ${value.text}`,
    validate: (value) =>
      value.text === "invalid" ? "Choose a different value." : null,
    render: ({ value, onValueChange, id, labelId, describedBy, disabled }) => (
      <Input
        id={id}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        disabled={disabled}
        value={value.text}
        onChange={(event) => onValueChange({ text: event.currentTarget.value })}
      />
    ),
  },
];
function Example({
  onChange = vi.fn(),
  initial = resetValue,
  ...props
}: Partial<
  Omit<FilterBarProps<Values>, "onValueChange" | "value" | "resetValue">
> & { onChange?: ReturnType<typeof vi.fn>; initial?: Values }) {
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState("");
  return (
    <>
      <FilterBar
        filters={filters}
        value={value}
        resetValue={resetValue}
        onValueChange={(next, details) => {
          setValue(next);
          onChange(next, details);
        }}
        search={{ value: query, onValueChange: setQuery }}
        locale="en-US"
        {...props}
      />
      <output aria-label="Values">{JSON.stringify(value)}</output>
      <output aria-label="Search value">{query}</output>
      <Button
        onClick={() =>
          setValue((previous) => ({ ...previous, status: "external", page: 2 }))
        }
      >
        External update
      </Button>
    </>
  );
}
const readValue = () =>
  JSON.parse(
    document.querySelector('output[aria-label="Values"]')!.textContent!,
  ) as Values;
async function open() {
  await userEvent.click(screen.getByRole("button", { name: /^Filters/ }));
  return screen.findByRole("dialog", { name: "Filters" });
}

it("renders search and actions without filters and never submits a surrounding form", async () => {
  const submit = vi.fn();
  const query = vi.fn();
  const ref = createRef<HTMLElement>();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FilterBar
        ref={ref}
        filters={[]}
        value={{}}
        resetValue={{}}
        onValueChange={vi.fn()}
        search={{
          value: "",
          onValueChange: query,
          "aria-label": "Search projects",
        }}
        actions={<Button type="button">Create</Button>}
      />
    </form>,
  );
  expect(ref.current?.getAttribute("data-slot")).toBe("filter-bar");
  expect(screen.queryByRole("button", { name: /^Filters/ })).toBeNull();
  await userEvent.type(
    screen.getByRole("searchbox", { name: "Search projects" }),
    "a",
  );
  expect(query).toHaveBeenCalledWith("a");
  await userEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(submit).not.toHaveBeenCalled();
});

it("updates instant filters and native search independently, with one clear-all update", async () => {
  const change = vi.fn();
  render(<Example onChange={change} />);
  await userEvent.type(screen.getByRole("searchbox"), "plants");
  expect(screen.getByRole("status", { name: "Search value" }).textContent).toBe(
    "plants",
  );
  expect(change).not.toHaveBeenCalled();
  const dialog = await open();
  await userEvent.click(within(dialog).getByText("Include archived"));
  await userEvent.click(within(dialog).getByRole("checkbox", { name: "Alex" }));
  await userEvent.type(
    within(dialog).getByRole("textbox", { name: "Email" }),
    "a",
  );
  expect(readValue()).toMatchObject({
    archived: true,
    owners: [0],
    email: "a",
  });
  expect(change).toHaveBeenCalledTimes(3);
  await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(
    screen.getByRole("button", { name: "Remove Owners filter" }).textContent,
  ).toContain("Alex");
  change.mockClear();
  await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]?.[1]).toEqual({ reason: "clear-all" });
  expect(readValue()).toEqual(resetValue);
  expect(screen.getByRole("status", { name: "Search value" }).textContent).toBe(
    "plants",
  );
});

it("stages edits, discards cancellation and Escape, and applies a complete update once", async () => {
  const change = vi.fn();
  render(<Example applyMode="staged" onChange={change} />);
  const dialog = await open();
  await userEvent.type(
    within(dialog).getByRole("textbox", { name: "Email" }),
    "draft",
  );
  expect(change).not.toHaveBeenCalled();
  await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await open();
  expect(
    (screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement).value,
  ).toBe("");
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Include archived" }),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(change).not.toHaveBeenCalled();
  await open();
  await userEvent.click(screen.getByRole("checkbox", { name: "Alex" }));
  await userEvent.type(
    screen.getByRole("textbox", { name: "Email" }),
    "committed",
  );
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]?.[0]).toMatchObject({
    owners: [0],
    email: "committed",
  });
  expect(change.mock.calls[0]?.[1].reason).toBe("apply");
});

it("merges edited fields into the latest external values and ignores removed or disabled edits", async () => {
  const change = vi.fn();
  const initial: Values = { ...resetValue, status: "active" };
  const view = render(
    <FilterBar
      filters={filters}
      value={initial}
      resetValue={resetValue}
      onValueChange={change}
      applyMode="staged"
    />,
  );
  await open();
  await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "draft");
  await userEvent.click(screen.getByRole("checkbox", { name: "Alex" }));
  view.rerender(
    <FilterBar<Values>
      filters={filters
        .map((filter) =>
          filter.id === "owners" ? { ...filter, disabled: true } : filter,
        )
        .filter((filter) => filter.id !== "archived")}
      value={{ ...initial, status: "external", page: 9 }}
      resetValue={resetValue}
      onValueChange={change}
      applyMode="staged"
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(change.mock.calls[0]?.[0]).toMatchObject({
    email: "draft",
    status: "external",
    page: 9,
    owners: [],
  });
});

it("preserves disabled active filters and unconfigured values when clearing", async () => {
  const change = vi.fn();
  render(
    <Example
      filters={filters.map((filter) =>
        filter.id === "archived" ? { ...filter, disabled: true } : filter,
      )}
      initial={{ ...resetValue, archived: true, email: "a", page: 8 }}
      onChange={change}
    />,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Remove Include archived filter",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(readValue()).toMatchObject({ archived: true, email: "", page: 8 });
});

it("uses semantic custom equality and blocks invalid staged values until corrected", async () => {
  const change = vi.fn();
  render(
    <Example
      applyMode="staged"
      onChange={change}
      initial={{ ...resetValue, custom: { text: "" } }}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Remove Custom filter" }),
  ).toBeNull();
  const dialog = await open();
  const input = within(dialog).getByRole("textbox", { name: "Custom" });
  await userEvent.type(input, "invalid");
  expect(await screen.findByText("Choose a different value.")).toBeTruthy();
  expect(
    (screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  await userEvent.clear(input);
  await userEvent.type(input, "valid");
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(change.mock.calls[0]?.[0].custom).toEqual({ text: "valid" });
});

it("collects numeric and date ranges without stringifying dates or losing zero", async () => {
  const change = vi.fn();
  render(
    <Example
      applyMode="staged"
      onChange={change}
      initial={{
        ...resetValue,
        delivery: parseDate("2026-10-21"),
        created: { start: parseDate("2026-10-01"), end: null },
      }}
    />,
  );
  const dialog = await open();
  const minimum = within(dialog).getByRole("textbox", {
    name: "Price Minimum",
  });
  const minimumLabel = within(dialog).getByText("Minimum");
  const maximumLabel = within(dialog).getByText("Maximum");
  expect(minimumLabel.tagName).toBe("LABEL");
  expect(maximumLabel.tagName).toBe("LABEL");
  expect(minimum.getAttribute("placeholder")).toBe("Minimum");
  expect(minimum.getAttribute("aria-labelledby")).toContain(minimumLabel.id);
  await userEvent.click(minimumLabel);
  expect(document.activeElement).toBe(minimum);
  await userEvent.type(minimum, "0");
  await userEvent.tab();
  const delivery = within(dialog).getByRole("group", { name: "Delivery" });
  const segments = within(delivery).getAllByRole("spinbutton");
  const day = segments.find((segment) =>
    segment.getAttribute("aria-label")?.startsWith("day"),
  )!;
  await userEvent.click(day);
  await userEvent.keyboard("{ArrowUp}");
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  const next = change.mock.calls[0]?.[0] as Values;
  expect(next.price).toEqual({ min: 0, max: null });
  expect(next.delivery?.toString()).toBe("2026-10-22");
  expect(next.delivery).not.toBeInstanceOf(Date);
  expect(next.created.start?.toString()).toBe("2026-10-01");
});

it("keeps invalid instant edits local and commits only their valid correction", async () => {
  const change = vi.fn();
  render(
    <Example
      onChange={change}
      initial={{ ...resetValue, price: { min: null, max: 10 } }}
    />,
  );
  const dialog = await open();
  const input = within(dialog).getByRole("textbox", { name: "Price Minimum" });
  fireEvent.change(input, { target: { value: "20" } });
  expect(
    await screen.findByText("The start must not be greater than the end."),
  ).toBeTruthy();
  expect(change).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "0" } });
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]?.[0].price).toEqual({ min: 0, max: 10 });
});

it("uses one panel across breakpoints and gives multiple bars distinct control IDs", async () => {
  const view = render(<Example applyMode="staged" filters={[filters[3]]} />);
  await open();
  const input = screen.getByRole("textbox", { name: "Email" });
  const id = input.id;
  await userEvent.type(input, "draft");
  act(() => {
    mobile = true;
    for (const listener of mediaListeners) listener();
  });
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog").getAttribute("data-swipe-direction")).toBe(
    "down",
  );
  expect(screen.getByRole("textbox", { name: "Email" }).id).toBe(id);
  view.unmount();
  render(
    <>
      <Example filters={[filters[3]]} defaultOpen />
      <Example filters={[filters[3]]} defaultOpen />
    </>,
  );
  const inputs = screen.getAllByLabelText("Email");
  expect(new Set(inputs.map((node) => node.id)).size).toBe(2);
});

it("preserves an unknown selection until explicitly cleared", async () => {
  render(<Example initial={{ ...resetValue, status: "removed" }} />);
  expect(
    screen.getByRole("button", { name: "Remove Status filter" }).textContent,
  ).toContain("removed");
  const dialog = await open();
  expect(
    within(dialog).getByRole("combobox", { name: "Status" }).textContent,
  ).toContain("removed");
  await userEvent.click(
    within(dialog).getByRole("button", { name: "Reset Status" }),
  );
  expect(readValue().status).toBeNull();
});

it("renders searchable multiple selection with loading and empty states", async () => {
  render(
    <Example
      filters={[
        {
          type: "multi-select",
          id: "owners",
          label: "Owners",
          options: [
            { label: "Alex", value: 0 },
            { label: "Sam", value: 1 },
          ],
          searchable: true,
        },
      ]}
    />,
  );
  const dialog = await open();
  const input = within(dialog).getByRole("combobox", { name: "Owners" });
  await userEvent.click(input);
  await userEvent.type(input, "Alex");
  await userEvent.click(await screen.findByRole("option", { name: "Alex" }));
  expect(readValue().owners).toEqual([0]);
});

it("selects an enabled option without submitting the host form", async () => {
  const change = vi.fn();
  const submit = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Example filters={[filters[0]]} onChange={change} />
    </form>,
  );
  const dialog = await open();
  await userEvent.click(
    within(dialog).getByRole("combobox", { name: "Status" }),
  );
  await userEvent.click(await screen.findByRole("option", { name: "Active" }));
  expect(change.mock.calls[0]?.[0].status).toBe("active");
  await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
  expect(submit).not.toHaveBeenCalled();
});

it("keeps keyboard focus on remaining chips and then on the filter trigger", async () => {
  render(<Example initial={{ ...resetValue, archived: true, email: "a" }} />);
  const removeArchived = screen.getByRole("button", {
    name: "Remove Include archived filter",
  });
  await userEvent.click(removeArchived);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Remove Email filter" }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Remove Email filter" }),
  );
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: /^Filters/ }),
  );
});

it("lets custom activation differ from value equality", async () => {
  const custom: FilterBarDefinition<Values> = {
    id: "custom",
    type: "custom",
    label: "Custom",
    isEqual: (left, right) => left.text === right.text,
    isActive: (value) => value.text.trim().length > 0,
    render: ({ value, onValueChange, labelId }) => (
      <Input
        value={value.text}
        aria-labelledby={labelId}
        onChange={(event) => onValueChange({ text: event.currentTarget.value })}
      />
    ),
  };
  render(<Example filters={[custom]} />);
  await open();
  await userEvent.type(screen.getByRole("textbox", { name: "Custom" }), " ");
  expect(readValue().custom.text).toBe(" ");
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(
    screen.queryByRole("button", { name: "Remove Custom filter" }),
  ).toBeNull();
});
