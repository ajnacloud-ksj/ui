import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { DirectionProvider } from "@/primitives/direction-provider";

import { Select } from ".";

const options = [
  { label: "Apple", value: "apple", group: "Fresh" },
  { label: "Banana", value: "banana", group: "Fresh" },
  { label: "Cherry", value: "cherry", group: "Seasonal", disabled: true },
  { label: "Date", value: "date", group: "Seasonal" },
];
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => vi.unstubAllGlobals());

async function openSelect(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement = screen.getByRole("combobox"),
) {
  act(() => trigger.focus());
  await user.keyboard("{ArrowDown}");
  await screen.findByRole("listbox");
}

it("renders an options-driven select with a named trigger and string form values", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <form aria-label="Choice form">
      <label htmlFor="fruit">Fruit</label>
      <Select
        id="fruit"
        name="fruit"
        options={options}
        placeholder="Choose a fruit"
        onValueChange={changed}
      />
    </form>,
  );
  const trigger = screen.getByRole("combobox", { name: "Fruit" });
  expect(trigger.tagName).toBe("BUTTON");
  expect(trigger.textContent).toContain("Choose a fruit");
  await openSelect(user, trigger);
  await user.click(screen.getByRole("option", { name: "Banana" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(changed.mock.lastCall?.[0]).toBe("banana");
  expect(trigger.textContent).toContain("Banana");
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).get("fruit"),
  ).toBe("banana");
});

it("infers custom numeric values including zero and uses their labels before opening", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const people = [
    { id: 0, name: "Ada" },
    { id: 1, name: "Lin" },
  ];
  render(
    <Select
      aria-label="Owner"
      options={people}
      getLabel={(person) => person.name}
      getValue={(person) => person.id}
      defaultValue={1}
      onValueChange={changed}
      renderOption={(person) => (
        <span>
          {person.name}
          <small> Project owner</small>
        </span>
      )}
    />,
  );
  const trigger = screen.getByRole("combobox", { name: "Owner" });
  expect(trigger.textContent).toContain("Lin");
  await openSelect(user, trigger);
  await user.click(screen.getByRole("option", { name: /Ada/ }));
  expect(changed.mock.lastCall?.[0]).toBe(0);
  expect(trigger.textContent).toContain("Ada");
});

it("keeps Base UI multiple selection open, toggles items, and submits repeated values", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Choices">
      <Select
        aria-label="Fruit"
        options={options}
        multiple
        defaultValue={["apple"]}
        name="fruit"
      />
    </form>,
  );
  await openSelect(user);
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect(screen.getByRole("listbox").getAttribute("aria-multiselectable")).toBe(
    "true",
  );
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).getAll("fruit"),
  ).toEqual(["apple", "banana"]);
  await user.click(screen.getByRole("option", { name: "Apple" }));
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).getAll("fruit"),
  ).toEqual(["banana"]);
});

it("preserves cancelable value changes", async () => {
  const user = userEvent.setup();
  render(
    <Select
      aria-label="Fruit"
      options={options}
      defaultValue="apple"
      contentProps={{ alignItemWithTrigger: false }}
      onValueChange={(_, details) => details.cancel()}
    />,
  );
  await openSelect(user);
  await user.click(screen.getByRole("option", { name: "Banana" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.getByRole("combobox").textContent).toContain("Apple");
});

it("renders groups and keeps disabled choices unselectable during keyboard navigation", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Select
      aria-label="Fruit"
      options={options}
      groupBy={(option) => option.group}
      defaultValue="banana"
      onValueChange={changed}
      contentProps={{ alignItemWithTrigger: false }}
    />,
  );
  const trigger = screen.getByRole("combobox");
  await openSelect(user, trigger);
  expect(screen.getAllByRole("group")).toHaveLength(2);
  expect(
    screen
      .getByRole("option", { name: "Cherry" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: "Banana" }),
    ),
  );
  await user.keyboard("{ArrowDown}{Enter}");
  expect(changed).not.toHaveBeenCalled();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(changed.mock.lastCall?.[0]).toBe("date");
});

it("uses native typeahead without rendering a search input", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Select
      aria-label="Fruit"
      options={options}
      onValueChange={changed}
      contentProps={{ alignItemWithTrigger: false }}
    />,
  );
  await openSelect(user);
  await user.keyboard("ban{Enter}");
  expect(changed.mock.lastCall?.[0]).toBe("banana");
  expect(screen.queryByRole("textbox")).toBeNull();
});

it.each(["disabled", "readOnly"] as const)(
  "preserves Base UI's %s state",
  async (prop) => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        options={options}
        defaultValue="apple"
        onValueChange={changed}
        {...{ [prop]: true }}
      />,
    );
    if (prop === "disabled") await user.click(screen.getByRole("combobox"));
    else await openSelect(user);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox").textContent).toContain("Apple");
    if (prop === "disabled") expect(screen.queryByRole("listbox")).toBeNull();
    else {
      await user.click(screen.getByRole("option", { name: "Banana" }));
      expect(changed).not.toHaveBeenCalled();
    }
  },
);

it("passes refs to the actual trigger and Base UI's hidden form input", () => {
  const trigger = createRef<HTMLButtonElement>();
  const input = createRef<HTMLInputElement>();
  render(
    <Select
      ref={trigger}
      inputRef={input}
      aria-label="Fruit"
      options={options}
      name="fruit"
      defaultValue="apple"
    />,
  );
  expect(trigger.current).toBe(screen.getByRole("combobox"));
  expect(input.current?.name).toBe("fruit");
  act(() => trigger.current?.focus());
  expect(document.activeElement).toBe(trigger.current);
  act(() => trigger.current?.blur());
  expect(document.activeElement).not.toBe(trigger.current);
});

it("retains native required validation and external form association", async () => {
  const user = userEvent.setup();
  render(
    <>
      <form id="owner-form" aria-label="External form">
        <button type="reset">Reset</button>
      </form>
      <Select
        aria-label="Fruit"
        form="owner-form"
        name="fruit"
        required
        options={options}
      />
    </>,
  );
  const form = screen.getByRole("form") as HTMLFormElement;
  expect(form.checkValidity()).toBe(false);
  await openSelect(user);
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get("fruit")).toBe("banana");
});

it("supports custom value rendering and state-based trigger styles", () => {
  render(
    <Select
      aria-label="Fruit"
      options={options}
      multiple
      defaultValue={["apple", "banana"]}
      style={{ color: "red" }}
      triggerProps={{
        style: (state) => ({ opacity: state.open ? 0.5 : 1 }),
        className: (state) => (state.open ? "is-open" : "is-closed"),
      }}
      valueProps={{
        children: (values: string[]) => `${values.length} selected`,
      }}
    />,
  );
  const trigger = screen.getByRole("combobox");
  expect(trigger.textContent).toContain("2 selected");
  expect(trigger.style.color).toBe("red");
  expect(trigger.style.opacity).toBe("1");
  expect(trigger.classList.contains("is-closed")).toBe(true);
});

it("composes shadcn-style manual parts and preserves RTL through the portal", async () => {
  const user = userEvent.setup();
  render(
    <DirectionProvider direction="rtl">
      <Select.Root items={options}>
        <Select.Trigger aria-label="Manual fruit">
          <Select.Value placeholder="Choose" />
        </Select.Trigger>
        <Select.Content alignItemWithTrigger={false}>
          <Select.Group>
            <Select.Label>Fruit</Select.Label>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Separator />
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </DirectionProvider>,
  );
  await openSelect(user);
  expect(
    document.querySelector('[data-slot="select-content"]')?.getAttribute("dir"),
  ).toBe("rtl");
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect(screen.getByRole("combobox").textContent).toContain("Banana");
});
