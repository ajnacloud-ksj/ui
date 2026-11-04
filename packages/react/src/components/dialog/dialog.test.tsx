import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog.js";

function Example({
  controlled = false,
  container,
}: {
  controlled?: boolean;
  container?: HTMLElement;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog {...(controlled ? { open, onOpenChange: setOpen } : {})}>
      <DialogTrigger render={<Button />}>Open settings</DialogTrigger>
      <DialogContent container={container}>
        <DialogTitle>Project settings</DialogTitle>
        <DialogDescription>Manage this project.</DialogDescription>
        <DialogClose render={<Button />}>Done</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("keeps Base UI class callbacks and forwards popup refs", async () => {
    let panel: HTMLDivElement | null = null;
    render(
      <Dialog defaultOpen>
        <DialogContent
          ref={(element) => {
            panel = element;
          }}
          className={() => "custom-panel max-w-xl p-8"}
        >
          <DialogTitle className={() => "custom-title"}>
            Custom dialog
          </DialogTitle>
          <DialogDescription className={() => "custom-description"}>
            Custom appearance.
          </DialogDescription>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Custom dialog" });
    expect(panel).toBe(dialog);
    expect(dialog.classList.contains("custom-panel")).toBe(true);
    expect(dialog.classList.contains("max-w-xl")).toBe(true);
    expect(dialog.classList.contains("p-8")).toBe(true);
    expect(dialog.classList.contains("max-w-lg")).toBe(false);
    expect(screen.getByRole("heading").classList.contains("custom-title")).toBe(
      true,
    );
    expect(
      screen
        .getByText("Custom appearance.")
        .classList.contains("custom-description"),
    ).toBe(true);
  });
  it.each([false, true])(
    "opens, labels its content, and closes (controlled=%s)",
    async (controlled) => {
      const user = userEvent.setup();
      render(<Example controlled={controlled} />);
      await user.click(screen.getByRole("button", { name: "Open settings" }));
      const dialog = await screen.findByRole("dialog", {
        name: "Project settings",
      });
      const descriptionId = dialog.getAttribute("aria-describedby");
      expect(
        descriptionId && document.getElementById(descriptionId)?.textContent,
      ).toBe("Manage this project.");
      await user.click(screen.getByRole("button", { name: "Done" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    },
  );

  it("portals into a supplied container and restores focus on Escape", async () => {
    const user = userEvent.setup();
    const container = document.createElement("div");
    document.body.appendChild(container);
    try {
      render(<Example container={container} />);
      const trigger = screen.getByRole("button", { name: "Open settings" });
      await user.click(trigger);
      expect(container.contains(await screen.findByRole("dialog"))).toBe(true);
      await user.keyboard("{Escape}");
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    } finally {
      container.remove();
    }
  });
});

it("provides a built-in close button and can hide it for custom dismissal", async () => {
  const user = userEvent.setup();
  const view = render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Default close</DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  );
  await user.click(await screen.findByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  view.unmount();
  render(
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Custom close</DialogTitle>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>,
  );
  const close = await screen.findAllByRole("button", {
    name: "Close",
  });
  expect(close).toHaveLength(1);
  expect(close[0].closest('[data-slot="dialog-footer"]')).toBeTruthy();
  await user.click(close[0]);
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
