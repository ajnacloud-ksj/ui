import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, forwardRef, type ReactNode, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Sidebar, type SidebarProviderProps, useSidebar } from ".";

function mockMedia(mobile = false, reduced = false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : mobile,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  );
}

const originalAnimations = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "getAnimations",
);
beforeAll(() =>
  Object.defineProperty(HTMLElement.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  }),
);
afterAll(() => {
  if (originalAnimations)
    Object.defineProperty(
      HTMLElement.prototype,
      "getAnimations",
      originalAnimations,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "getAnimations");
});
beforeEach(() => {
  mockMedia();
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
  vi.unstubAllGlobals();
});

function Layout({ children, ...props }: SidebarProviderProps) {
  return (
    <Sidebar.Provider contained {...props}>
      <Sidebar aria-label="Workspace">{children}</Sidebar>
      <main>Page</main>
    </Sidebar.Provider>
  );
}
function State() {
  const { state, width, isResizing } = useSidebar();
  return (
    <output data-testid="state">
      {state}:{width}:{String(isResizing)}
    </output>
  );
}
function Menu({ children }: { children?: ReactNode }) {
  return (
    <Sidebar.Content>
      <Sidebar.Menu>
        <Sidebar.MenuButton href="/home" active tooltip="Home">
          Home
        </Sidebar.MenuButton>
        {children}
      </Sidebar.Menu>
    </Sidebar.Content>
  );
}

it("toggles an uncontrolled sidebar and honors canceled trigger clicks", async () => {
  const user = userEvent.setup();
  render(
    <Layout>
      <Menu />
      <State />
      <Sidebar.Footer>
        <Sidebar.Trigger />
      </Sidebar.Footer>
    </Layout>,
  );
  await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
  expect(
    screen
      .getByRole("button", { name: "Expand sidebar" })
      .getAttribute("aria-expanded"),
  ).toBe("false");
  await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
  expect(screen.getByTestId("state").textContent).toContain("expanded");
});

it("keeps controlled state and supplies updated provider settings to the hook", async () => {
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <Layout open onOpenChange={onOpenChange}>
      <State />
      <Sidebar.Trigger />
    </Layout>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Collapse sidebar" }),
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByTestId("state").textContent).toContain("expanded");
  rerender(
    <Layout open={false} peekable onOpenChange={onOpenChange}>
      <State />
      <Sidebar.Trigger />
    </Layout>,
  );
  fireEvent.mouseEnter(document.querySelector('[data-sidebar="peek-zone"]')!);
  expect(screen.getByTestId("state").textContent).toContain("peeking");
});

it("does not toggle when the consumer prevents the trigger action", async () => {
  render(
    <Layout>
      <State />
      <Sidebar.Trigger onClick={(event) => event.preventDefault()} />
    </Layout>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Collapse sidebar" }),
  );
  expect(screen.getByTestId("state").textContent).toContain("expanded");
});

it("keeps fixed sidebars expanded even when defaultOpen is false", async () => {
  render(
    <Layout collapsible="none" defaultOpen={false}>
      <State />
      <Sidebar.Trigger />
      <Menu />
    </Layout>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Collapse sidebar" }),
  );
  expect(screen.getByTestId("state").textContent).toContain("expanded");
  expect(
    document
      .querySelector('[data-sidebar="sidebar"]')
      ?.getAttribute("data-state"),
  ).toBe("expanded");
});

it("peeks only from the header/content area, without changing the layout rail", () => {
  render(
    <Layout defaultOpen={false} peekable>
      <Menu />
      <State />
      <Sidebar.Footer>Footer</Sidebar.Footer>
    </Layout>,
  );
  fireEvent.mouseEnter(document.querySelector('[data-sidebar="footer"]')!);
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
  const zone = document.querySelector('[data-sidebar="peek-zone"]')!;
  fireEvent.mouseEnter(zone);
  expect(screen.getByTestId("state").textContent).toContain("peeking");
  expect(
    (document.querySelector('[data-sidebar="sidebar"]') as HTMLElement).style
      .width,
  ).toBe("var(--sidebar-width-icon)");
  expect(
    (
      document.querySelector(
        '[data-sidebar="content-container"]',
      ) as HTMLElement
    ).style.width,
  ).toBe("var(--sidebar-width)");
  fireEvent.mouseLeave(zone);
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
});

it("makes offcanvas content inert while hidden", () => {
  const { rerender } = render(
    <Layout collapsible="offcanvas" open={false}>
      <Menu />
    </Layout>,
  );
  const content = document.querySelector('[data-sidebar="content-container"]')!;
  expect(content.hasAttribute("inert")).toBe(true);
  expect(content.getAttribute("aria-hidden")).toBe("true");
  rerender(
    <Layout collapsible="offcanvas" open>
      <Menu />
    </Layout>,
  );
  expect(content.hasAttribute("inert")).toBe(false);
  expect(content.hasAttribute("aria-hidden")).toBe(false);
});

it("creates valid lists, forwards link attributes, and avoids double-wrapping explicit items", () => {
  render(
    <Layout>
      <Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton
            href="/docs"
            target="_blank"
            rel="noreferrer"
            icon={<svg />}
          >
            Docs<Sidebar.MenuBadge>New</Sidebar.MenuBadge>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Menu>
    </Layout>,
  );
  const menu = document.querySelector('[data-sidebar="menu"]')!;
  expect([...menu.children].every((child) => child.tagName === "LI")).toBe(
    true,
  );
  expect(menu.querySelector("li li")).toBeNull();
  const home = screen.getByRole("link", { name: "Home" });
  expect(home.getAttribute("aria-current")).toBe("page");
  const docs = screen.getByRole("link", { name: "DocsNew" });
  expect(docs.getAttribute("target")).toBe("_blank");
  expect(docs.getAttribute("rel")).toBe("noreferrer");
  expect(docs.querySelector('[aria-hidden="true"]')).not.toBeNull();
});

it("composes router links with render and forwards the actual anchor ref", () => {
  const Link = forwardRef<
    HTMLAnchorElement,
    { href?: string; children?: ReactNode }
  >(({ children, ...props }, ref) => (
    <a {...props} ref={ref} data-router="test">
      {children}
    </a>
  ));
  Link.displayName = "TestLink";
  const ref = createRef<HTMLElement>();
  render(
    <Layout>
      <Sidebar.Menu>
        <Sidebar.MenuButton ref={ref} href="/projects" render={<Link />}>
          Projects
        </Sidebar.MenuButton>
      </Sidebar.Menu>
    </Layout>,
  );
  expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  expect(ref.current?.getAttribute("data-router")).toBe("test");
  expect(ref.current?.getAttribute("href")).toBe("/projects");
});

it("prevents disabled button and link actions", () => {
  const action = vi.fn();
  render(
    <Layout>
      <Sidebar.Menu>
        <Sidebar.MenuButton disabled onClick={action}>
          Disabled action
        </Sidebar.MenuButton>
        <Sidebar.MenuButton href="/disabled" disabled onClick={action}>
          Disabled link
        </Sidebar.MenuButton>
      </Sidebar.Menu>
    </Layout>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Disabled action" }));
  fireEvent.click(screen.getByRole("link", { name: "Disabled link" }));
  expect(action).not.toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Disabled link" }).tabIndex).toBe(-1);
});

function Section() {
  return (
    <Sidebar.MenuItem>
      <Sidebar.Collapsible>
        <Sidebar.CollapsibleTrigger
          render={
            <Sidebar.MenuButton>
              Projects
              <Sidebar.MenuChevron />
            </Sidebar.MenuButton>
          }
        />
        <Sidebar.CollapsibleContent data-testid="section">
          <Sidebar.MenuSub>
            <Sidebar.MenuSubButton href="/active" active>
              Active projects
            </Sidebar.MenuSubButton>
            <Sidebar.MenuSubItem>
              <Sidebar.MenuSubButton>Archived projects</Sidebar.MenuSubButton>
            </Sidebar.MenuSubItem>
          </Sidebar.MenuSub>
        </Sidebar.CollapsibleContent>
      </Sidebar.Collapsible>
    </Sidebar.MenuItem>
  );
}
it("links disclosure controls to mounted, inert content and keeps submenu lists valid", () => {
  render(
    <Layout>
      <Sidebar.Content>
        <Sidebar.Menu>
          <Section />
        </Sidebar.Menu>
      </Sidebar.Content>
    </Layout>,
  );
  const trigger = screen.getByRole("button", { name: "Projects" });
  const content = screen.getByTestId("section");
  expect(trigger.getAttribute("aria-controls")).toBe(content.id);
  expect(content.hasAttribute("inert")).toBe(true);
  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(content.hasAttribute("inert")).toBe(false);
  const submenu = document.querySelector('[data-sidebar="menu-sub"]')!;
  expect([...submenu.children].every((child) => child.tagName === "LI")).toBe(
    true,
  );
  expect(submenu.querySelector(":scope > li > li")).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Active projects" })
      .getAttribute("aria-current"),
  ).toBe("page");
});

it("finishes transitions once, with a timer fallback and reduced motion", async () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const { rerender } = render(
      <Layout open animationDuration={100} onOpenChangeComplete={complete}>
        <State />
      </Layout>,
    );
    rerender(
      <Layout
        open={false}
        animationDuration={100}
        onOpenChangeComplete={complete}
      >
        <State />
      </Layout>,
    );
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(complete.mock.calls).toEqual([[false]]);
    mockMedia(false, true);
    rerender(
      <Layout open animationDuration={100} onOpenChangeComplete={complete}>
        <State />
      </Layout>,
    );
    expect(complete.mock.calls).toEqual([[false], [true]]);
  } finally {
    vi.useRealTimers();
  }
});

it("resizes with side-aware keyboard keys and clamps width", () => {
  const change = vi.fn();
  render(
    <Layout
      side="right"
      resizable
      minWidth={200}
      maxWidth={300}
      defaultWidth={220}
      onWidthChange={change}
    >
      <State />
      <Sidebar.ResizeHandle />
    </Layout>,
  );
  const handle = screen.getByRole("button", { name: "Resize sidebar" });
  fireEvent.keyDown(handle, { key: "ArrowLeft" });
  expect(change).toHaveBeenLastCalledWith(230);
  fireEvent.keyDown(handle, { key: "End" });
  expect(change).toHaveBeenLastCalledWith(300);
  fireEvent.keyDown(handle, { key: "Home" });
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
  fireEvent.keyDown(handle, { key: "ArrowLeft" });
  expect(screen.getByTestId("state").textContent).toContain("expanded:200");
  fireEvent.keyDown(handle, { key: "ArrowRight" });
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
});

it("resizes by pointer, collapses at the threshold, and cleans up canceled drags", () => {
  render(
    <Layout resizable minWidth={200} defaultWidth={240}>
      <State />
      <Sidebar.ResizeHandle />
    </Layout>,
  );
  const sidebar = document.querySelector('[data-sidebar="sidebar"]')!;
  vi.spyOn(sidebar, "getBoundingClientRect").mockReturnValue({
    width: 240,
  } as DOMRect);
  const handle = screen.getByRole("button", { name: "Resize sidebar" });
  fireEvent.pointerDown(handle, { button: 0, clientX: 240 });
  fireEvent.pointerMove(document, { clientX: 180 });
  expect(screen.getByTestId("state").textContent).toContain("collapsed");
  fireEvent.pointerMove(document, { clientX: 280 });
  expect(screen.getByTestId("state").textContent).toContain(
    "expanded:280:true",
  );
  fireEvent.pointerCancel(document);
  expect(screen.getByTestId("state").textContent).toContain("false");
  fireEvent.pointerMove(document, { clientX: 310 });
  expect(screen.getByTestId("state").textContent).toContain(":280:");
});

it.each(["left", "right"] as const)(
  "switches sliding views, makes inactive content inert, and supports %s direction",
  (direction) => {
    function Views() {
      const [view, setView] = useState("account");
      return (
        <Layout>
          <button onClick={() => setView("project")}>Switch</button>
          <Sidebar.SlidingViews activeKey={view} direction={direction}>
            <Sidebar.SlidingView value="account">Account</Sidebar.SlidingView>
            <Sidebar.SlidingView value="project">Project</Sidebar.SlidingView>
          </Sidebar.SlidingViews>
        </Layout>
      );
    }
    render(<Views />);
    const account = document.querySelector('[data-value="account"]')!;
    const project = document.querySelector('[data-value="project"]')!;
    expect(project.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Switch" }));
    expect(project.getAttribute("aria-hidden")).toBe("false");
    expect(account.hasAttribute("inert")).toBe(true);
    const track = document.querySelector(
      '[data-sidebar="sliding-views"] > div',
    ) as HTMLElement;
    expect(track.style.transform).toBe(
      `translateX(${direction === "left" ? "-" : ""}100%)`,
    );
  },
);

it("provides a labeled loading state and forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Layout>
      <Sidebar.Loading ref={ref} label="Loading navigation" />
    </Layout>,
  );
  expect(screen.getByRole("status", { name: "Loading navigation" })).toBe(
    ref.current,
  );
  expect(ref.current?.querySelectorAll('[data-slot="skeleton"]').length).toBe(
    14,
  );
});

it("server-renders a stable desktop layout even for mobile clients", () => {
  mockMedia(true);
  const html = renderToString(
    <Layout>
      <Menu />
    </Layout>,
  );
  expect(html).toContain("<aside");
  expect(html).not.toContain('data-mobile="true"');
});

describe("mobile sidebar", () => {
  beforeEach(() => mockMedia(true));
  it("uses the external opener, traps focus, and returns focus after dismissal", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar.Provider contained animationDuration={0}>
        <Sidebar aria-label="Workspace">
          <Sidebar.Header>
            <Sidebar.Close />
          </Sidebar.Header>
          <Menu />
        </Sidebar>
        <main>
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );
    const opener = screen.getByRole("button", { name: "Expand sidebar" });
    await user.click(opener);
    const dialog = await screen.findByRole("dialog", { name: "Workspace" });
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    expect(opener.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
  it("uses controlled open on mobile and closes through the internal Close control", async () => {
    const change = vi.fn();
    render(
      <Sidebar.Provider open onOpenChange={change} contained>
        <Sidebar fullScreenOnMobile>
          <Sidebar.Close />
          <Menu />
        </Sidebar>
      </Sidebar.Provider>,
    );
    expect(screen.getByRole("dialog")).not.toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Close navigation" }),
    );
    expect(change).toHaveBeenCalledWith(false);
  });
});

it.each(["start", "center", "end", "auto"] as const)(
  "scrolls only the owning viewport using %s alignment",
  (align) => {
    function Jump() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          onClick={() => scrollToItem("target", { align, behavior: "smooth" })}
        >
          Jump
        </button>
      );
    }
    render(
      <Layout>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton itemId="target">Target</Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Jump />
      </Layout>,
    );
    const viewport = document.querySelector(
      '[data-sidebar="viewport"]',
    ) as HTMLElement;
    const target = document.querySelector(
      '[data-sidebar-item-id="target"]',
    ) as HTMLElement;
    Object.defineProperties(viewport, {
      clientHeight: { value: 200 },
      offsetHeight: { value: 200 },
      scrollHeight: { value: 1000 },
    });
    Object.defineProperty(target, "offsetHeight", { value: 40 });
    vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({
      top: 0,
      height: 200,
      bottom: 200,
    } as DOMRect);
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 600,
      height: 40,
      bottom: 640,
    } as DOMRect);
    const scroll = vi.fn();
    viewport.scrollTo = scroll;
    fireEvent.click(screen.getByRole("button", { name: "Jump" }));
    expect(scroll).toHaveBeenCalledWith({
      top: align === "start" ? 600 : align === "center" ? 520 : 440,
      behavior: "smooth",
    });
  },
);

it("keeps visible items in place, ignores unknown IDs, and honors reduced motion", () => {
  mockMedia(false, true);
  function Jump() {
    const { scrollToItem, scrollItemIntoView } = useSidebar();
    return (
      <>
        <button
          onClick={() => scrollItemIntoView("target", { align: "start" })}
        >
          Visible
        </button>
        <button onClick={() => scrollToItem("missing")}>Missing</button>
        <button
          onClick={() =>
            scrollToItem("target", { align: "center", behavior: "smooth" })
          }
        >
          Center
        </button>
      </>
    );
  }
  render(
    <Layout>
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuButton itemId="target">Target</Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Content>
      <Jump />
    </Layout>,
  );
  const viewport = document.querySelector(
    '[data-sidebar="viewport"]',
  ) as HTMLElement;
  const target = document.querySelector(
    '[data-sidebar-item-id="target"]',
  ) as HTMLElement;
  Object.defineProperties(viewport, {
    clientHeight: { value: 200 },
    offsetHeight: { value: 200 },
    scrollHeight: { value: 1000 },
  });
  Object.defineProperty(target, "offsetHeight", { value: 40 });
  vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({
    top: 0,
    height: 200,
    bottom: 200,
  } as DOMRect);
  vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
    top: 50,
    height: 40,
    bottom: 90,
  } as DOMRect);
  const scroll = vi.fn();
  viewport.scrollTo = scroll;
  fireEvent.click(screen.getByRole("button", { name: "Visible" }));
  fireEvent.click(screen.getByRole("button", { name: "Missing" }));
  expect(scroll).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Center" }));
  expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
});

it.each(["left", "right"] as const)(
  "dismisses the mobile %s sidebar with a touch swipe and restores focus",
  async (side) => {
    mockMedia(true);
    const user = userEvent.setup();
    render(
      <Sidebar.Provider side={side} contained animationDuration={0}>
        <Sidebar aria-label="Swipe navigation">
          <Sidebar.Header>Workspace</Sidebar.Header>
          <Menu />
          <Sidebar.Close />
        </Sidebar>
        <main>
          <Sidebar.Trigger />
        </main>
      </Sidebar.Provider>,
    );
    const opener = screen.getByRole("button", { name: "Expand sidebar" });
    await user.click(opener);
    const panel = await screen.findByRole("dialog", {
      name: "Swipe navigation",
    });
    expect(panel.getAttribute("data-swipe-direction")).toBe(side);
    expect(panel.getAttribute("data-swipe-axis")).toBe("x");
    const header = panel.querySelector<HTMLElement>('[data-sidebar="header"]')!;
    const pointDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "elementFromPoint",
    );
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => header,
    });
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      right: 260,
      top: 0,
      bottom: 320,
      width: 260,
      height: 320,
      toJSON: () => ({}),
    });
    try {
      const start = side === "left" ? 230 : 30;
      const sign = side === "left" ? -1 : 1;
      const touch = (x: number, y = 40) => ({
        identifier: 1,
        target: header,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        screenX: x,
        screenY: y,
      });
      fireEvent.touchStart(header, { touches: [touch(start)] });
      fireEvent.touchMove(header, { touches: [touch(start, 140)] });
      fireEvent.touchEnd(header, {
        touches: [],
        changedTouches: [touch(start, 140)],
      });
      expect(screen.getByRole("dialog", { name: "Swipe navigation" })).toBe(
        panel,
      );
      fireEvent.touchStart(header, { touches: [touch(start)] });
      fireEvent.touchMove(header, { touches: [touch(start + sign * 20)] });
      fireEvent.touchMove(header, { touches: [touch(start + sign * 200)] });
      await waitFor(() =>
        expect(panel.hasAttribute("data-swiping")).toBe(true),
      );
      expect(
        Number.parseFloat(
          panel.style.getPropertyValue("--drawer-swipe-movement-x"),
        ) * sign,
      ).toBeGreaterThan(0);
      fireEvent.touchEnd(header, {
        touches: [],
        changedTouches: [touch(start + sign * 200)],
      });
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Swipe navigation" }),
        ).toBeNull(),
      );
      await waitFor(() => expect(document.activeElement).toBe(opener));
    } finally {
      if (pointDescriptor)
        Object.defineProperty(document, "elementFromPoint", pointDescriptor);
      else Reflect.deleteProperty(document, "elementFromPoint");
    }
  },
);
