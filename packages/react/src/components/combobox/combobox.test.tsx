import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Combobox } from ".";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry", disabled: true },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
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

it("filters options, selects by keyboard, submits the selected value, and clears", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <form aria-label="Fruit form">
      <Combobox
        aria-label="Fruit"
        options={options}
        name="fruit"
        onValueChange={changed}
        isClearable
      />
    </form>,
  );
  const input = screen.getByRole("combobox", { name: "Fruit" });
  await user.click(input);
  await user.type(input, "ban");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  await user.keyboard("{ArrowDown}{Enter}");
  expect(changed.mock.lastCall?.[0]).toBe("banana");
  expect(changed.mock.lastCall?.[1].selectedOptions).toEqual([options[1]]);
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).get("fruit"),
  ).toBe("banana");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.getByText("Banana")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(changed.mock.lastCall?.[0]).toBeNull();
  expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
});

it("supports numeric custom values including zero and renders original option objects", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const users = [
    { id: 0, name: "Ada", email: "ada@example.com" },
    { id: 2, name: "Lin", email: "lin@example.com" },
  ];
  render(
    <Combobox
      aria-label="User"
      options={users}
      getLabel={(user) => user.name}
      getValue={(user) => user.id}
      onValueChange={changed}
      renderOption={(user, state) => (
        <span>
          {user.name}
          <small>{user.email}</small>
          {state.selected && " selected"}
        </span>
      )}
    />,
  );
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: /Ada/ }));
  expect(changed.mock.lastCall?.[0]).toBe(0);
  expect(changed.mock.lastCall?.[1].selectedOptions[0]).toBe(users[0]);
});

it("keeps selection unchanged when a change is canceled", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Combobox
      aria-label="Fruit"
      options={options}
      defaultValue="apple"
      onValueChange={(next, details) => {
        changed(next);
        details.cancel();
      }}
      isClearable
    />,
  );
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(changed).toHaveBeenCalledWith(null);
  expect(screen.getByText("Apple")).toBeTruthy();
});

it("keeps multiple selection open, removes the correct visible pill, and submits repeated values", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Choices">
      <Combobox
        multiple
        aria-label="Fruit"
        name="fruit"
        options={options}
        defaultValue={["apple", "banana", "date", "elderberry"]}
        maxVisibleSelections={2}
        isClearable
      />
    </form>,
  );
  expect(screen.getByText("+2")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Remove Banana" }));
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).getAll("fruit"),
  ).toEqual(["apple", "date", "elderberry"]);
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect(screen.getByRole("listbox")).toBeTruthy();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).getAll("fruit"),
  ).toEqual([]);
});

it.each(["names", "count"] as const)(
  "supports the %s selection display",
  (display) => {
    render(
      <Combobox
        multiple
        aria-label="Fruit"
        options={options}
        defaultValue={["apple", "banana", "date"]}
        selectionDisplay={display}
        maxVisibleSelections={2}
      />,
    );
    expect(
      screen.getByText(display === "count" ? "3 selected" : "+1"),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
  },
);

it("preserves selected labels through remote result changes without injecting selected records into results", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <Combobox aria-label="Fruit" options={[options[0]]} defaultValue="apple" />,
  );
  rerender(
    <Combobox aria-label="Fruit" options={[options[1]]} defaultValue="apple" />,
  );
  expect(screen.getByText("Apple")).toBeTruthy();
  await user.click(screen.getByRole("combobox"));
  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByRole("option", { name: "Banana" })).toBeTruthy();
});

it("resolves initial selected records and missing values, and updates labels", () => {
  const { rerender } = render(
    <Combobox
      aria-label="Fruit"
      options={[]}
      value="apple"
      selectedOptions={[options[0]]}
    />,
  );
  expect(screen.getByText("Apple")).toBeTruthy();
  rerender(
    <Combobox
      aria-label="Fruit"
      options={[{ label: "Fresh apple", value: "apple" }]}
      value="apple"
      selectedOptions={[options[0]]}
    />,
  );
  expect(screen.getByText("Fresh apple")).toBeTruthy();
  rerender(
    <Combobox
      aria-label="Fruit"
      options={[]}
      value="unknown"
      getMissingLabel={(value) => `Missing: ${value}`}
    />,
  );
  expect(screen.getByText("Missing: unknown")).toBeTruthy();
});

it("keeps loading searchable, suppresses empty content, and retains the footer", async () => {
  const user = userEvent.setup();
  render(
    <Combobox
      aria-label="Fruit"
      options={[]}
      isLoading
      footer={<button>Retry loading</button>}
    />,
  );
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.type(input, "ap");
  expect((input as HTMLInputElement).value).toBe("ap");
  expect(input.getAttribute("aria-busy")).toBe("true");
  expect(screen.queryByText("No results found.")).toBeNull();
  const empty = document.querySelector('[data-slot="combobox-empty"]');
  expect(empty?.getAttribute("aria-live")).toBe("polite");
  expect(empty?.classList.contains("hidden")).toBe(false);
  expect(screen.getByRole("button", { name: "Retry loading" })).toBeTruthy();
  expect(screen.getByText(/Loading…/).closest('[role="status"]')).toBeTruthy();
});

it("supports grouping, disabled options, and externally filtered results", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Combobox
      aria-label="Fruit"
      options={options}
      groupBy={(option) => (option.value[0] < "c" ? "First" : "Other")}
      filterOption={null}
      onValueChange={changed}
    />,
  );
  await user.click(screen.getByRole("combobox"));
  await user.type(screen.getByRole("combobox"), "not-a-match");
  expect(screen.getAllByRole("option")).toHaveLength(5);
  expect(
    screen
      .getAllByRole("group")
      .some((group) => group.getAttribute("aria-labelledby")),
  ).toBe(true);
  await user.click(screen.getByRole("option", { name: "Cherry" }));
  expect(changed).not.toHaveBeenCalled();
});

it("exposes the native input ref and treats portaled footer focus as inside the field", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLInputElement>();
  const focus = vi.fn();
  const blur = vi.fn();
  render(
    <>
      <Combobox
        ref={ref}
        aria-label="Fruit"
        options={options}
        onFocus={focus}
        onBlur={blur}
        footer={<button>Footer action</button>}
      />
      <button>Next field</button>
    </>,
  );
  act(() => ref.current?.focus({ preventScroll: true }));
  expect(ref.current).toBe(screen.getByRole("combobox"));
  expect(focus).toHaveBeenCalledTimes(1);
  await user.keyboard("{ArrowDown}");
  act(() => screen.getByRole("button", { name: "Footer action" }).focus());
  await act(async () => {
    await Promise.resolve();
  });
  expect(blur).not.toHaveBeenCalled();
  expect(focus).toHaveBeenCalledTimes(1);
  await user.click(screen.getByText("Next field"));
  await waitFor(() => expect(blur).toHaveBeenCalledTimes(1));
  act(() => ref.current?.focus());
  act(() => ref.current?.blur());
  await waitFor(() => expect(blur).toHaveBeenCalledTimes(2));
});

it("restores default values on native form reset", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Reset form">
      <Combobox
        aria-label="Fruit"
        options={options}
        defaultValue="apple"
        name="fruit"
        isClearable
      />
      <button type="reset">Reset</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  await user.click(screen.getByRole("button", { name: "Reset" }));
  await waitFor(() =>
    expect(
      new FormData(screen.getByRole("form") as HTMLFormElement).get("fruit"),
    ).toBe("apple"),
  );
});

it("lets a footer inspect search and selection and close the popup", async () => {
  const user = userEvent.setup();
  render(
    <Combobox
      aria-label="Fruit"
      options={options}
      footer={({ inputValue, close }) => (
        <button onClick={close}>Create {inputValue}</button>
      )}
    />,
  );
  await user.type(screen.getByRole("combobox"), "new");
  await user.click(screen.getByRole("button", { name: "Create new" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(document.activeElement).toBe(screen.getByRole("combobox"));
});

it("composes the shadcn-style parts for a manual popup", async () => {
  const user = userEvent.setup();
  render(
    <Combobox.Root items={["Apple", "Banana"]}>
      <Combobox.Input aria-label="Manual fruit" showClear />
      <Combobox.Content>
        <Combobox.Empty>Nothing</Combobox.Empty>
        <Combobox.List>
          {(fruit: string) => (
            <Combobox.Item key={fruit} value={fruit}>
              {fruit}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>,
  );
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(
    "Banana",
  );
});

it.each([true, false])(
  "can keep a single-selection popup open (closeOnSelect=%s)",
  async (closeOnSelect) => {
    const user = userEvent.setup();
    render(
      <Combobox
        aria-label="Fruit"
        options={options}
        closeOnSelect={closeOnSelect}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Banana" }));
    if (closeOnSelect)
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    else expect(screen.getByRole("listbox")).toBeTruthy();
  },
);

it("can retain a multi-selection query and filter out selected options", async () => {
  const user = userEvent.setup();
  render(
    <Combobox
      multiple
      aria-label="Fruit"
      options={options}
      clearSearchOnSelect={false}
      hideSelectedOptions
    />,
  );
  const input = screen.getByRole("combobox");
  await user.type(input, "ban");
  await user.click(screen.getByRole("option", { name: "Banana" }));
  expect((input as HTMLInputElement).value).toBe("ban");
  expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
  expect(screen.getByRole("listbox")).toBeTruthy();
});

it("uses selected values for required validation and supports an external form", async () => {
  const user = userEvent.setup();
  render(
    <>
      <form id="fruit-owner" aria-label="External form" />
      <Combobox
        aria-label="Fruit"
        options={options}
        required
        name="fruit"
        form="fruit-owner"
      />
    </>,
  );
  const form = screen.getByRole("form") as HTMLFormElement;
  await user.type(screen.getByRole("combobox"), "not-an-option");
  expect(form.checkValidity()).toBe(false);
  await user.clear(screen.getByRole("combobox"));
  await user.type(screen.getByRole("combobox"), "ban");
  await user.keyboard("{ArrowDown}{Enter}");
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get("fruit")).toBe("banana");
});

it("supports native input events without treating cleared search as cleared selection", async () => {
  const user = userEvent.setup();
  const nativeBlur = vi.fn();
  const nativeChange = vi.fn();
  const selectionChange = vi.fn();
  render(
    <Combobox
      aria-label="Fruit"
      options={options}
      defaultValue="apple"
      onValueChange={selectionChange}
      inputProps={{ onChange: nativeChange, onBlur: nativeBlur }}
    />,
  );
  const input = screen.getByRole("combobox");
  await user.type(input, "ban");
  await user.clear(input);
  expect(selectionChange).not.toHaveBeenCalled();
  expect(nativeChange).toHaveBeenCalled();
  act(() => (input as HTMLInputElement).blur());
  expect(nativeBlur).toHaveBeenCalled();
});

it.each(["disabled", "readOnly"] as const)(
  "does not clear or remove a %s selection",
  async (prop) => {
    render(
      <Combobox
        multiple
        aria-label="Fruit"
        options={options}
        defaultValue={["apple"]}
        isClearable
        {...{ [prop]: true }}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Clear selection" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove Apple" })).toBeNull();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(prop === "disabled" ? input.disabled : input.readOnly).toBe(true);
  },
);

it("keeps keyboard pill removal aligned when later selections are collapsed", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Keyboard choices">
      <Combobox
        multiple
        aria-label="Fruit"
        name="fruit"
        options={options}
        defaultValue={["apple", "banana", "date"]}
        maxVisibleSelections={2}
      />
    </form>,
  );
  const input = screen.getByRole("combobox");
  act(() => (input as HTMLInputElement).focus());
  await user.keyboard("{ArrowLeft}{Backspace}");
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).getAll("fruit"),
  ).toEqual(["apple", "date"]);
});

it("supports zero rendered pills with clear-all and a custom selection renderer", async () => {
  const user = userEvent.setup();
  render(
    <Combobox
      multiple
      aria-label="Fruit"
      options={options}
      defaultValue={["apple"]}
      maxVisibleSelections={0}
      isClearable
      renderSelectedOption={({ label }) => <strong>{label}</strong>}
    />,
  );
  expect(screen.getByText("+1")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(screen.queryByText("+1")).toBeNull();
});

it("allows keyboard focus to reach the footer and leave the complete field", async () => {
  const user = userEvent.setup();
  const blur = vi.fn();
  render(
    <>
      <Combobox
        aria-label="Fruit"
        options={options}
        onBlur={blur}
        footer={<button>Footer action</button>}
      />
      <button>After field</button>
    </>,
  );
  await user.click(screen.getByRole("combobox"));
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Footer action" }),
  );
  expect(blur).not.toHaveBeenCalled();
  await user.tab();
  await waitFor(() => expect(blur).toHaveBeenCalledTimes(1));
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "After field" }),
  );
});

it("traverses enabled footer actions and returns to the input with Shift+Tab", async () => {
  const user = userEvent.setup();
  render(
    <Combobox
      aria-label="Fruit"
      options={options}
      footer={
        <>
          <button disabled>Unavailable</button>
          <button hidden>Hidden action</button>
          <button>First action</button>
          <button>Last action</button>
        </>
      }
    />,
  );
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "First action" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Last action" }),
  );
  await user.tab({ shift: true });
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(input);
});
