import { DirectionProvider } from "@base-ui/react/direction-provider";
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { ScrollArea } from ".";

it("forwards the native scroll viewport ref, label, events, and content", () => {
  const root = createRef<HTMLDivElement>();
  const viewport = createRef<HTMLDivElement>();
  const scroll = vi.fn();
  render(
    <ScrollArea
      orientation="both"
      ref={root}
      viewportProps={{
        ref: viewport,
        role: "region",
        "aria-label": "Activity",
        onScroll: scroll,
        className: (state) => (state.scrolling ? "scrolling" : "idle"),
      }}
    >
      <p>Release published</p>
    </ScrollArea>,
  );
  expect(viewport.current).toBe(
    screen.getByRole("region", { name: "Activity" }),
  );
  expect(root.current?.contains(viewport.current)).toBe(true);
  expect(
    viewport.current?.contains(screen.getByText("Release published")),
  ).toBe(true);
  expect(viewport.current?.getAttribute("data-fade")).toBe("true");
  fireEvent.scroll(viewport.current!);
  expect(scroll).toHaveBeenCalledTimes(1);
});

it("can disable fades and follows RTL for horizontal fade direction", () => {
  const { container, rerender } = render(
    <ScrollArea fade={false}>Content</ScrollArea>,
  );
  expect(
    container
      .querySelector('[data-slot="scroll-area-viewport"]')
      ?.getAttribute("data-fade"),
  ).toBeNull();
  expect(
    container.querySelector('[data-slot="scroll-area-viewport"]')?.className,
  ).not.toContain("mask-image");
  rerender(
    <DirectionProvider direction="rtl">
      <ScrollArea dir="rtl">Content</ScrollArea>
    </DirectionProvider>,
  );
  expect(
    container.querySelector('[data-slot="scroll-area-viewport"]')?.className,
  ).toContain("to_left");
});
