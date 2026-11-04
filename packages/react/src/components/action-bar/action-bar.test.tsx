import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from ".";

it("portals only while open, forwards refs and supports a custom container and render", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <ActionBar ref={ref} portalContainer={host} render={<section />}>
      <ActionBarSelection>2 selected</ActionBarSelection>
    </ActionBar>,
  );
  expect(screen.queryByRole("toolbar")).toBeNull();
  view.rerender(
    <ActionBar open ref={ref} portalContainer={host} render={<section />}>
      <ActionBarSelection>2 selected</ActionBarSelection>
    </ActionBar>,
  );
  const bar = screen.getByRole("toolbar", { name: "Selection actions" });
  expect(ref.current).toBe(bar);
  expect(bar.tagName).toBe("SECTION");
  expect(bar.parentElement).toBe(host);
  expect(screen.getByRole("status").textContent).toBe("2 selected");
  view.unmount();
  host.remove();
});

it("uses logical edge positioning, exposes orientation, and permits style overrides", () => {
  render(
    <ActionBar
      open
      side="top"
      sideOffset={24}
      align="end"
      alignOffset={8}
      dir="rtl"
      orientation="vertical"
      style={{ position: "absolute" }}
    >
      <ActionBarSeparator />
      <ActionBarGroup aria-label="Actions">
        <ActionBarItem>Archive</ActionBarItem>
      </ActionBarGroup>
    </ActionBar>,
  );
  const bar = screen.getByRole("toolbar");
  expect(bar.style.top).toContain("24px");
  expect(bar.style.insetInlineEnd).toBe("calc(24px)");
  expect(bar.style.position).toBe("absolute");
  expect(bar.getAttribute("data-align")).toBe("end");
  expect(bar.getAttribute("dir")).toBe("rtl");
  expect(bar.getAttribute("aria-orientation")).toBe("vertical");
  expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe(
    "horizontal",
  );
});

it("keeps each group as a roving tab stop and the close button as a separate stop", async () => {
  render(
    <>
      <button>Before actions</button>
      <ActionBar defaultOpen loop={false}>
        <ActionBarGroup aria-label="Bulk actions">
          <ActionBarItem>Archive</ActionBarItem>
          <ActionBarItem disabled focusableWhenDisabled={false}>
            Disabled
          </ActionBarItem>
          <ActionBarItem>Download</ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose />
      </ActionBar>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Before actions" }));
  await userEvent.tab();
  const archive = screen.getByRole("button", { name: "Archive" });
  const download = screen.getByRole("button", { name: "Download" });
  expect(document.activeElement).toBe(archive);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(download);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(download);
  await userEvent.keyboard("{Home}");
  expect(document.activeElement).toBe(archive);
  await userEvent.keyboard("{End}");
  expect(document.activeElement).toBe(download);
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Dismiss action bar" }),
  );
});

it("supports vertical and RTL navigation and wrapping", async () => {
  const view = render(
    <ActionBar open dir="rtl">
      <ActionBarGroup>
        <ActionBarItem>First</ActionBarItem>
        <ActionBarItem>Second</ActionBarItem>
      </ActionBarGroup>
    </ActionBar>,
  );
  screen.getByRole("button", { name: "First" }).focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Second" }),
  );
  await userEvent.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "First" }),
  );
  view.rerender(
    <ActionBar open orientation="vertical">
      <ActionBarGroup>
        <ActionBarItem>First</ActionBarItem>
        <ActionBarItem>Second</ActionBarItem>
      </ActionBarGroup>
    </ActionBar>,
  );
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Second" }),
  );
});

it("preserves focus on opening, clears controlled selection on dismissal, and restores focus", async () => {
  function Example() {
    const [selected, setSelected] = useState(false);
    return (
      <>
        <button onClick={() => setSelected(true)}>Select a document</button>
        <ActionBar open={selected} onOpenChange={setSelected}>
          <ActionBarGroup>
            <ActionBarItem>Archive document</ActionBarItem>
          </ActionBarGroup>
          <ActionBarClose />
        </ActionBar>
      </>
    );
  }
  render(<Example />);
  const select = screen.getByRole("button", { name: "Select a document" });
  await userEvent.click(select);
  expect(document.activeElement).toBe(select);
  await userEvent.click(
    screen.getByRole("button", { name: "Dismiss action bar" }),
  );
  expect(screen.queryByRole("toolbar")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(select));
});

it("handles document Escape and lets handlers cancel dismissal", () => {
  const change = vi.fn();
  const cancel = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const view = render(
    <ActionBar defaultOpen onOpenChange={change} onEscapeKeyDown={cancel}>
      <ActionBarClose />
    </ActionBar>,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("toolbar")).toBeTruthy();
  view.rerender(
    <ActionBar defaultOpen onOpenChange={change}>
      <ActionBarClose />
    </ActionBar>,
  );
  fireEvent.keyDown(document, { key: "Escape", isComposing: true });
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.queryByRole("toolbar")).toBeNull();
});

it("preserves a controlled open value until its owner changes it and honors prevented close clicks", async () => {
  const change = vi.fn();
  const view = render(
    <ActionBar open onOpenChange={change}>
      <ActionBarClose onClick={(event) => event.preventDefault()} />
    </ActionBar>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(change).not.toHaveBeenCalled();
  view.rerender(
    <ActionBar open onOpenChange={change}>
      <ActionBarClose />
    </ActionBar>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.getByRole("toolbar")).toBeTruthy();
});

it("calls onSelect without closing, respects cancellation, and blocks disabled/loading actions", async () => {
  const select = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <ActionBar open>
      <ActionBarGroup>
        <ActionBarItem ref={ref} onSelect={select}>
          Archive
        </ActionBarItem>
        <ActionBarItem
          onSelect={select}
          onClick={(event) => event.preventDefault()}
        >
          Canceled
        </ActionBarItem>
        <ActionBarItem disabled onSelect={select}>
          Disabled
        </ActionBarItem>
        <ActionBarItem loading onSelect={select}>
          Saving
        </ActionBarItem>
      </ActionBarGroup>
      <ActionBarItem onSelect={select}>Outside group</ActionBarItem>
    </ActionBar>,
  );
  const button = screen.getByRole("button", { name: "Archive" });
  expect(ref.current).toBe(button);
  expect(button.getAttribute("type")).toBe("button");
  await userEvent.click(button);
  expect(select).toHaveBeenCalledOnce();
  expect(screen.getByRole("toolbar")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Canceled" }));
  await userEvent.click(screen.getByRole("button", { name: "Disabled" }));
  const loading = screen.getByRole("button", { name: "Saving" });
  await userEvent.click(loading);
  expect(loading.getAttribute("aria-busy")).toBe("true");
  expect(
    loading
      .querySelector('[data-ajna-component="spinner"]')
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(select).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: "Outside group" }));
  expect(select).toHaveBeenCalledTimes(2);
});

it("does not steal focus back from another control when externally closed", async () => {
  const view = render(
    <>
      <button>Other control</button>
      <ActionBar open>
        <ActionBarGroup>
          <ActionBarItem>Archive</ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Archive" }));
  await userEvent.click(screen.getByRole("button", { name: "Other control" }));
  view.rerender(
    <>
      <button>Other control</button>
      <ActionBar open={false} />
    </>,
  );
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Other control" }),
  );
});

it("lets a nested menu consume Escape before dismissing the bar", async () => {
  const { DropdownMenu } = await import("@/components/dropdown-menu");
  const change = vi.fn();
  render(
    <ActionBar open onOpenChange={change}>
      <ActionBarGroup>
        <DropdownMenu.Root>
          <ActionBarItem render={<DropdownMenu.Trigger />}>
            More actions
          </ActionBarItem>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </ActionBarGroup>
    </ActionBar>,
  );
  await userEvent.click(screen.getByRole("button", { name: "More actions" }));
  expect(await screen.findByRole("menu")).toBeTruthy();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("toolbar")).toBeTruthy();
  await userEvent.keyboard("{Escape}");
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});
