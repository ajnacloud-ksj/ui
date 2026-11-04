import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "@/components/button";

import { AlertDialog } from ".";

it("labels an alert dialog, focuses cancel, blocks pointer dismissal, and restores focus", async () => {
  const user = userEvent.setup();
  render(
    <AlertDialog>
      <AlertDialog.Trigger render={<Button />}>
        Delete project
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete this project?</AlertDialog.Title>
          <AlertDialog.Description>
            This removes the project permanently.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>,
  );
  const trigger = screen.getByRole("button", { name: "Delete project" });
  await user.click(trigger);
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete this project?",
  });
  expect(
    document.getElementById(dialog.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toContain("permanently");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" }),
    ),
  );
  await user.click(
    document.querySelector('[data-slot="alert-dialog-overlay"]')!,
  );
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});
it("keeps actions application-owned and supports pending buttons", async () => {
  const user = userEvent.setup();
  const action = vi.fn();
  const { rerender } = render(
    <AlertDialog defaultOpen>
      <AlertDialog.Content>
        <AlertDialog.Title>Confirm</AlertDialog.Title>
        <AlertDialog.Description>Choose an action.</AlertDialog.Description>
        <AlertDialog.Action onClick={action}>Continue</AlertDialog.Action>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      </AlertDialog.Content>
    </AlertDialog>,
  );
  await user.click(await screen.findByRole("button", { name: "Continue" }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  rerender(
    <AlertDialog defaultOpen>
      <AlertDialog.Content>
        <AlertDialog.Title>Confirm</AlertDialog.Title>
        <AlertDialog.Description>Choose an action.</AlertDialog.Description>
        <AlertDialog.Action loading onClick={action}>
          Continue
        </AlertDialog.Action>
        <AlertDialog.Cancel disabled>Cancel</AlertDialog.Cancel>
      </AlertDialog.Content>
    </AlertDialog>,
  );
  expect(
    (screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
it("forwards popup refs, small size, class callbacks, and custom portal containers", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const ref = createRef<HTMLDivElement>();
  const { unmount } = render(
    <AlertDialog open>
      <AlertDialog.Content
        container={container}
        ref={ref}
        size="sm"
        className={() => "p-8"}
      >
        <AlertDialog.Title>Small</AlertDialog.Title>
        <AlertDialog.Description>Compact confirmation.</AlertDialog.Description>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      </AlertDialog.Content>
    </AlertDialog>,
  );
  const dialog = await screen.findByRole("alertdialog");
  expect(ref.current).toBe(dialog);
  expect(container.contains(dialog)).toBe(true);
  expect(dialog.classList.contains("max-w-xs")).toBe(true);
  expect(dialog.classList.contains("p-8")).toBe(true);
  unmount();
  container.remove();
});
