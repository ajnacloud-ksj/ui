import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from ".";

const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
  if (originalScrollIntoView)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      originalScrollIntoView,
    );
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});

it("filters and ranks aliases, hides empty groups, and shows the empty state", async () => {
  const user = userEvent.setup();
  render(
    <Command label="Actions">
      <CommandInput placeholder="Search commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar">Calendar</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="billing" keywords={["payments", "invoices"]}>
            Billing
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
  const input = screen.getByRole("combobox");
  await user.type(input, "invoices");
  expect(screen.getByRole("option", { name: "Billing" })).toBeTruthy();
  expect(screen.queryByRole("option", { name: "Calendar" })).toBeNull();
  await user.clear(input);
  await user.type(input, "nothing-matches");
  expect(screen.getByText("No results found.")).toBeTruthy();
  expect(screen.queryAllByRole("option")).toHaveLength(0);
});

it("navigates enabled items with looping, preserves input focus, and activates without submitting", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  const submit = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Command label="Actions" loop>
        <CommandInput />
        <CommandList>
          <CommandItem value="first" onSelect={select}>
            First
          </CommandItem>
          <CommandItem value="disabled" disabled onSelect={select}>
            Disabled
          </CommandItem>
          <CommandItem value="last" onSelect={select}>
            Last
          </CommandItem>
        </CommandList>
      </Command>
    </form>,
  );
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("option", { name: "Last" }).getAttribute("data-selected"),
  ).toBe("true");
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("option", { name: "First" }).getAttribute("data-selected"),
  ).toBe("true");
  await user.keyboard("{ArrowUp}{Enter}");
  expect(select).toHaveBeenCalledWith("last");
  expect(submit).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(input);
});

it("supports controlled queries separately from controlled highlighted values and external filtering", async () => {
  const user = userEvent.setup();
  function Controlled() {
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState("alpha");
    return (
      <Command
        label="Controlled actions"
        value={highlight}
        onValueChange={setHighlight}
        shouldFilter={false}
      >
        <CommandInput value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandItem value="alpha">Alpha</CommandItem>
          <CommandItem value="beta">Beta</CommandItem>
        </CommandList>
        <output>
          {query}:{highlight}
        </output>
      </Command>
    );
  }
  render(<Controlled />);
  await user.type(screen.getByRole("combobox"), "remote-query");
  expect(screen.getAllByRole("option")).toHaveLength(2);
  expect(screen.getByText("remote-query:alpha")).toBeTruthy();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByText("remote-query:beta")).toBeTruthy();
});

it("preserves custom filters, pointer selection, checked metadata, and shortcut content", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  render(
    <Command
      label="Preferences"
      filter={(value, query) => (value.startsWith(query) ? 1 : 0)}
    >
      <CommandInput />
      <CommandList>
        <CommandItem value="dark" data-checked="true" onSelect={select}>
          Dark mode<CommandShortcut>⌘D</CommandShortcut>
        </CommandItem>
        <CommandItem value="light">Light mode</CommandItem>
      </CommandList>
    </Command>,
  );
  const item = screen.getByRole("option", { name: /Dark mode/ });
  expect(item.getAttribute("data-checked")).toBe("true");
  expect(screen.getByText("⌘D").getAttribute("data-slot")).toBe(
    "command-shortcut",
  );
  await user.type(screen.getByRole("combobox"), "da");
  await user.click(item);
  expect(select).toHaveBeenCalledWith("dark");
  expect(screen.queryByRole("option", { name: "Light mode" })).toBeNull();
});

it("uses Ajna Dialog for accessible naming, initial focus, close controls, and focus return", async () => {
  const user = userEvent.setup();
  function Palette() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open commands</button>
        <CommandDialog
          open={open}
          onOpenChange={setOpen}
          title="Quick actions"
          description="Find an action to run."
          showCloseButton
        >
          <Command label="Search actions">
            <CommandInput />
            <CommandList>
              <CommandItem value="calendar">Calendar</CommandItem>
            </CommandList>
          </Command>
        </CommandDialog>
      </>
    );
  }
  render(<Palette />);
  const opener = screen.getByRole("button", { name: "Open commands" });
  await user.click(opener);
  const dialog = await screen.findByRole("dialog", { name: "Quick actions" });
  expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("combobox"));
  await user.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(opener);
  await user.click(opener);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(opener);
});

it("forwards refs and native input attributes", () => {
  const root = createRef<HTMLDivElement>();
  const input = createRef<HTMLInputElement>();
  const list = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  render(
    <Command ref={root} label="Actions">
      <CommandInput ref={input} placeholder="Find" autoComplete="off" />
      <CommandList ref={list}>
        <CommandItem ref={item} value="calendar">
          Calendar
        </CommandItem>
      </CommandList>
    </Command>,
  );
  expect(root.current?.getAttribute("data-slot")).toBe("command");
  expect(input.current).toBe(screen.getByRole("combobox"));
  expect(input.current?.getAttribute("autocomplete")).toBe("off");
  expect(list.current?.getAttribute("role")).toBe("listbox");
  expect(item.current).toBe(screen.getByRole("option"));
  fireEvent.change(input.current!, { target: { value: "calendar" } });
  expect(input.current?.value).toBe("calendar");
});
