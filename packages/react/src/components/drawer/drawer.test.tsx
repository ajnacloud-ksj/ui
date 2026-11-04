import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "@/components/button";
import { Input } from "@/components/input";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerSwipeDirection,
  DrawerTitle,
  DrawerTrigger,
} from ".";

it.each([false, true])(
  "opens, associates its labels, closes, and restores focus (controlled=%s)",
  async (controlled) => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <Drawer
          {...(controlled ? { open, onOpenChange: setOpen } : {})}
          showSwipeHandle
        >
          <DrawerTrigger render={<Button />}>Edit project</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Project details</DrawerTitle>
              <DrawerDescription>Update your project name.</DrawerDescription>
            </DrawerHeader>
            <Input aria-label="Project name" />
            <DrawerFooter>
              <DrawerClose render={<Button />}>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Edit project" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: "Project details",
    });
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Update your project name.");
    expect(
      dialog
        .querySelector('[data-slot="drawer-swipe-handle"]')
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(dialog.querySelector('[data-slot="drawer-content"]')).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  },
);

it.each(["up", "down", "left", "right"] as DrawerSwipeDirection[])(
  "exposes the %s direction and correct swipe axis",
  async (direction) => {
    render(
      <Drawer defaultOpen swipeDirection={direction}>
        <DrawerContent>
          <DrawerTitle>Positioned drawer</DrawerTitle>
          <DrawerDescription>Directional content.</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-swipe-direction")).toBe(direction);
    expect(dialog.getAttribute("data-swipe-axis")).toBe(
      ["up", "down"].includes(direction) ? "y" : "x",
    );
    expect(
      dialog.querySelector('[data-slot="drawer-swipe-handle"]'),
    ).toBeNull();
  },
);

it("preserves custom portal destinations, refs, keepMounted, initial focus, and class callbacks", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const popupRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  const view = render(
    <Drawer>
      <DrawerTrigger>Open custom drawer</DrawerTrigger>
      <DrawerContent
        container={container}
        keepMounted
        ref={popupRef}
        initialFocus={inputRef}
        className={() => "custom-popup w-80"}
        overlayClassName={() => "custom-overlay"}
        viewportClassName={() => "custom-viewport"}
      >
        <DrawerTitle className={() => "custom-title"}>
          Custom drawer
        </DrawerTitle>
        <DrawerDescription className={() => "custom-description"}>
          Custom presentation.
        </DrawerDescription>
        <Input aria-label="Drawer input" ref={inputRef} />
        <DrawerClose>Close custom drawer</DrawerClose>
      </DrawerContent>
    </Drawer>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Open custom drawer" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(popupRef.current).toBe(dialog);
  expect(container.contains(dialog)).toBe(true);
  expect(dialog.classList.contains("w-80")).toBe(true);
  expect(container.querySelector(".custom-overlay")).toBeTruthy();
  expect(container.querySelector(".custom-viewport")).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(inputRef.current));
  await userEvent.click(
    screen.getByRole("button", { name: "Close custom drawer" }),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(container.querySelector('[data-slot="drawer-popup"]')).toBe(dialog);
  view.unmount();
  container.remove();
});

it("dismisses with Escape and supports canceling a dismissal", async () => {
  const change = vi.fn();
  const view = render(
    <Drawer
      defaultOpen
      onOpenChange={(open, details) => {
        change(open, details.reason);
        if (!open) details.cancel();
      }}
    >
      <DrawerContent>
        <DrawerTitle>Protected drawer</DrawerTitle>
        <DrawerDescription>Dismissal can be canceled.</DrawerDescription>
        <DrawerClose>Close protected drawer</DrawerClose>
      </DrawerContent>
    </Drawer>,
  );
  await screen.findByRole("dialog");
  await userEvent.keyboard("{Escape}");
  expect(change).toHaveBeenCalledWith(false, "escape-key");
  expect(screen.getByRole("dialog")).toBeTruthy();
  view.rerender(
    <Drawer defaultOpen onOpenChange={change}>
      <DrawerContent>
        <DrawerTitle>Protected drawer</DrawerTitle>
        <DrawerDescription>Dismissal is now allowed.</DrawerDescription>
        <DrawerClose>Close protected drawer</DrawerClose>
      </DrawerContent>
    </Drawer>,
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it.each([false, "trap-focus"] as const)(
  "omits the overlay for modal=%s and permits outside interaction",
  async (modal) => {
    const outside = vi.fn();
    render(
      <>
        <Button onClick={outside}>Outside action</Button>
        <Drawer defaultOpen modal={modal} disablePointerDismissal>
          <DrawerContent>
            <DrawerTitle>Supporting details</DrawerTitle>
            <DrawerDescription>This drawer has no overlay.</DrawerDescription>
            <DrawerClose>Close supporting details</DrawerClose>
          </DrawerContent>
        </Drawer>
      </>,
    );
    await screen.findByRole("dialog");
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeNull();
    await userEvent.click(screen.getByText("Outside action"));
    expect(outside).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).toBeTruthy();
  },
);

it("tracks controlled snap points and exposes the expanded state", async () => {
  function Example() {
    const [point, setPoint] = useState<number | string | null>(0.5);
    return (
      <Drawer
        defaultOpen
        snapPoints={[0.5, 1]}
        snapPoint={point}
        onSnapPointChange={setPoint}
      >
        <DrawerContent>
          <DrawerTitle>Snap drawer</DrawerTitle>
          <DrawerDescription>Expand for more details.</DrawerDescription>
          <Button onClick={() => setPoint(1)}>Expand drawer</Button>
        </DrawerContent>
      </Drawer>
    );
  }
  render(<Example />);
  const dialog = await screen.findByRole("dialog");
  expect(dialog.hasAttribute("data-snap-points")).toBe(true);
  expect(dialog.hasAttribute("data-expanded")).toBe(false);
  await userEvent.click(screen.getByRole("button", { name: "Expand drawer" }));
  await waitFor(() => expect(dialog.hasAttribute("data-expanded")).toBe(true));
});

it("keeps the parent mounted and closes only the nested drawer on Escape", async () => {
  render(
    <Drawer>
      <DrawerTrigger>Open parent drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Parent drawer</DrawerTitle>
        <DrawerDescription>Contains another drawer.</DrawerDescription>
        <Drawer>
          <DrawerTrigger>Open child drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Child drawer</DrawerTitle>
            <DrawerDescription>Independent content.</DrawerDescription>
            <DrawerClose>Close child drawer</DrawerClose>
          </DrawerContent>
        </Drawer>
        <DrawerClose>Close parent drawer</DrawerClose>
      </DrawerContent>
    </Drawer>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Open parent drawer" }),
  );
  const parent = await screen.findByRole("dialog", { name: "Parent drawer" });
  const childTrigger = screen.getByRole("button", {
    name: "Open child drawer",
  });
  await userEvent.click(childTrigger);
  await screen.findByRole("dialog", { name: "Child drawer" });
  await waitFor(() =>
    expect(parent.hasAttribute("data-nested-drawer-open")).toBe(true),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "Child drawer" })).toBeNull(),
  );
  expect(screen.getByRole("dialog", { name: "Parent drawer" })).toBe(parent);
  expect(document.activeElement).toBe(childTrigger);
});

it("does not close a non-modal drawer on an outside press when dismissal is disabled", async () => {
  render(
    <>
      <button>Background control</button>
      <Drawer defaultOpen modal={false} disablePointerDismissal>
        <DrawerContent>
          <DrawerTitle>Persistent details</DrawerTitle>
          <DrawerDescription>Outside presses are allowed.</DrawerDescription>
        </DrawerContent>
      </Drawer>
    </>,
  );
  await screen.findByRole("dialog");
  fireEvent.pointerDown(
    screen.getByRole("button", { name: "Background control" }),
  );
  fireEvent.pointerUp(
    screen.getByRole("button", { name: "Background control" }),
  );
  expect(screen.getByRole("dialog")).toBeTruthy();
});
