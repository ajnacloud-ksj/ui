import { DirectionProvider } from "@base-ui/react/direction-provider";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from ".";

it.each(["ltr", "rtl"] as const)(
  "tracks overflowing tab edges without scrollbars in %s",
  (direction) => {
    const { container } = render(
      <DirectionProvider direction={direction}>
        <Tabs defaultValue="overview">
          <TabsList aria-label="Sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )!;
    Object.defineProperties(viewport, {
      clientWidth: { value: 200, configurable: true },
      scrollWidth: { value: 500, configurable: true },
      clientHeight: { value: 36, configurable: true },
      scrollHeight: { value: 36, configurable: true },
    });
    fireEvent.scroll(viewport);
    expect(viewport.hasAttribute("data-overflow-x-start")).toBe(false);
    expect(viewport.hasAttribute("data-overflow-x-end")).toBe(true);
    viewport.scrollLeft = direction === "rtl" ? -150 : 150;
    fireEvent.scroll(viewport);
    expect(viewport.hasAttribute("data-overflow-x-start")).toBe(true);
    expect(viewport.hasAttribute("data-overflow-x-end")).toBe(true);
    viewport.scrollLeft = direction === "rtl" ? -300 : 300;
    fireEvent.scroll(viewport);
    expect(viewport.hasAttribute("data-overflow-x-start")).toBe(true);
    expect(viewport.hasAttribute("data-overflow-x-end")).toBe(false);
    expect(
      container.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).toBeNull();
    expect(viewport.tabIndex).toBe(-1);
    expect(screen.getByRole("tablist", { name: "Sections" })).toBeTruthy();
  },
);

it("connects named tabs and panels, forwards refs, and supports manual activation", async () => {
  const user = userEvent.setup();
  const root = createRef<HTMLDivElement>();
  const list = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLElement>();
  const panel = createRef<HTMLDivElement>();
  render(
    <Tabs ref={root} defaultValue="overview" data-testid="root">
      <TabsList ref={list} aria-label="Project sections">
        <TabsTrigger value="overview" ref={trigger}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="reports" disabled>
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" ref={panel}>
        Project overview
      </TabsContent>
      <TabsContent value="settings">Project settings</TabsContent>
    </Tabs>,
  );
  expect(root.current).toBe(screen.getByTestId("root"));
  expect(list.current).toBe(
    screen.getByRole("tablist", { name: "Project sections" }),
  );
  const overview = screen.getByRole("tab", { name: "Overview" });
  const settings = screen.getByRole("tab", { name: "Settings" });
  expect(trigger.current).toBe(overview);
  expect(panel.current).toBe(
    screen.getByRole("tabpanel", { name: "Overview" }),
  );
  expect(overview.getAttribute("aria-controls")).toBe(panel.current?.id);
  expect(panel.current?.getAttribute("aria-labelledby")).toBe(overview.id);
  await user.tab();
  expect(document.activeElement).toBe(overview);
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Reports" }),
  );
  await user.keyboard("{Enter}");
  expect(overview.getAttribute("aria-selected")).toBe("true");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(settings);
  expect(settings.getAttribute("aria-selected")).toBe("false");
  expect(screen.getByRole("tabpanel", { name: "Overview" })).toBeTruthy();
  await user.keyboard("{Enter}");
  expect(settings.getAttribute("aria-selected")).toBe("true");
  expect(screen.queryByRole("tabpanel", { name: "Overview" })).toBeNull();
  expect(screen.getByRole("tabpanel", { name: "Settings" }).textContent).toBe(
    "Project settings",
  );
  await user.keyboard("{Home}");
  expect(document.activeElement).toBe(overview);
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(settings);
});

it("supports automatic activation, controlled numeric values, and event details", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  function Example() {
    const [value, setValue] = useState<number | null>(0);
    return (
      <>
        <Tabs
          value={value}
          onValueChange={(next, details) => {
            change(next, details);
            setValue(next);
          }}
        >
          <TabsList activateOnFocus aria-label="Numeric sections">
            <TabsTrigger value={0}>Zero</TabsTrigger>
            <TabsTrigger value={1}>One</TabsTrigger>
          </TabsList>
          <TabsContent value={0}>Zero content</TabsContent>
          <TabsContent value={1}>One content</TabsContent>
        </Tabs>
        <button onClick={() => setValue(null)}>Clear</button>
      </>
    );
  }
  render(<Example />);
  await user.tab();
  await user.keyboard("{ArrowRight}");
  expect(change.mock.lastCall?.[0]).toBe(1);
  expect(change.mock.lastCall?.[1].reason).toBe("none");
  expect(typeof change.mock.lastCall?.[1].cancel).toBe("function");
  expect(
    screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
  ).toBe("true");
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.queryByRole("tabpanel")).toBeNull();
  for (const tab of screen.getAllByRole("tab"))
    expect(tab.getAttribute("aria-selected")).toBe("false");
});

it("allows cancellation and preserves render, nativeButton, style, and class callbacks", async () => {
  const user = userEvent.setup();
  render(
    <Tabs
      defaultValue="a"
      onValueChange={(value, details) => {
        if (value === "b") details.cancel();
      }}
    >
      <TabsList
        aria-label="Cancellable sections"
        className={(state) => `list-${state.orientation}`}
      >
        <TabsTrigger
          value="a"
          render={<button type="button" data-custom="yes" />}
          className={(state) => (state.active ? "selected" : "inactive")}
          style={(state) => ({ opacity: state.active ? 1 : 0.5 })}
        >
          A
        </TabsTrigger>
        <TabsTrigger value="b" nativeButton={false} render={<a href="#b">B</a>}>
          B
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="a"
        className={(state) => `panel-${state.orientation}`}
      >
        A content
      </TabsContent>
    </Tabs>,
  );
  const a = screen.getByRole("tab", { name: "A" });
  expect(a.getAttribute("data-custom")).toBe("yes");
  expect(a.classList.contains("selected")).toBe(true);
  expect(a.style.opacity).toBe("1");
  expect(
    screen.getByRole("tablist").classList.contains("list-horizontal"),
  ).toBe(true);
  expect(
    screen.getByRole("tabpanel").classList.contains("panel-horizontal"),
  ).toBe(true);
  const b = screen.getByRole("tab", { name: "B" });
  expect(b.tagName).toBe("A");
  await user.click(b);
  expect(a.getAttribute("aria-selected")).toBe("true");
  expect(b.getAttribute("aria-selected")).toBe("false");
});

it("preserves form inputs with keepMounted and resets unmounted inputs", async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="kept">
      <TabsList aria-label="Drafts">
        <TabsTrigger value="kept">Kept</TabsTrigger>
        <TabsTrigger value="temporary">Temporary</TabsTrigger>
        <TabsTrigger value="other">Other</TabsTrigger>
      </TabsList>
      <TabsContent value="kept" keepMounted>
        <label>
          Kept draft
          <input />
        </label>
      </TabsContent>
      <TabsContent value="temporary">
        <label>
          Temporary draft
          <input />
        </label>
      </TabsContent>
      <TabsContent value="other">Other content</TabsContent>
    </Tabs>,
  );
  await user.type(
    screen.getByRole("textbox", { name: "Kept draft" }),
    "Keep this",
  );
  await user.click(screen.getByRole("tab", { name: "Temporary" }));
  expect(screen.queryByRole("textbox", { name: "Kept draft" })).toBeNull();
  await user.type(
    screen.getByRole("textbox", { name: "Temporary draft" }),
    "Discard this",
  );
  await user.click(screen.getByRole("tab", { name: "Other" }));
  await user.click(screen.getByRole("tab", { name: "Kept" }));
  expect(
    (screen.getByRole("textbox", { name: "Kept draft" }) as HTMLInputElement)
      .value,
  ).toBe("Keep this");
  await user.click(screen.getByRole("tab", { name: "Temporary" }));
  expect(
    (
      screen.getByRole("textbox", {
        name: "Temporary draft",
      }) as HTMLInputElement
    ).value,
  ).toBe("");
});

it("supports vertical and RTL navigation without sharing nested tab styles or selection", async () => {
  const user = userEvent.setup();
  render(
    <Tabs orientation="vertical" defaultValue="a">
      <TabsList aria-label="Outer sections" variant="underline" size="sm">
        <TabsTrigger value="a">Outer A</TabsTrigger>
        <TabsTrigger value="b">Outer B</TabsTrigger>
      </TabsList>
      <TabsContent value="a" keepMounted>
        <DirectionProvider direction="rtl">
          <div dir="rtl">
            <Tabs defaultValue="a">
              <TabsList aria-label="Inner sections" activateOnFocus>
                <TabsTrigger value="a">Inner A</TabsTrigger>
                <TabsTrigger value="b">Inner B</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Inner A content</TabsContent>
              <TabsContent value="b">Inner B content</TabsContent>
            </Tabs>
          </div>
        </DirectionProvider>
      </TabsContent>
      <TabsContent value="b">Outer B content</TabsContent>
    </Tabs>,
  );
  const outer = within(screen.getByRole("tablist", { name: "Outer sections" }));
  const inner = within(screen.getByRole("tablist", { name: "Inner sections" }));
  const outerA = outer.getByRole("tab", { name: "Outer A" });
  const innerA = inner.getByRole("tab", { name: "Inner A" });
  expect(outerA.getAttribute("data-variant")).toBe("underline");
  expect(innerA.getAttribute("data-variant")).toBe("segmented");
  expect(innerA.getAttribute("data-size")).toBe("base");
  innerA.focus();
  await user.keyboard("{ArrowLeft}");
  expect(
    inner.getByRole("tab", { name: "Inner B" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(outerA.getAttribute("aria-selected")).toBe("true");
  outerA.focus();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(
    outer.getByRole("tab", { name: "Outer B" }).getAttribute("aria-selected"),
  ).toBe("true");
});
