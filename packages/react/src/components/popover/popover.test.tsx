import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it } from "vitest";

import { Button } from "@/components/button";
import { Input } from "@/components/input";

import { Popover } from ".";

it("associates its title and description, focuses a control, and restores trigger focus", async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Popover.Root>
      <Popover.Trigger render={<Button />}>Edit project</Popover.Trigger>
      <Popover.Content ref={ref}>
        <Popover.Header>
          <Popover.Title>Project name</Popover.Title>
          <Popover.Description>
            Choose a name for this project.
          </Popover.Description>
        </Popover.Header>
        <Input aria-label="Name" />
        <Popover.Close render={<Button />}>Done</Popover.Close>
      </Popover.Content>
    </Popover.Root>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Edit project" });
  await user.click(trigger);
  const popup = await screen.findByRole("dialog", { name: "Project name" });
  expect(ref.current).toBe(popup);
  expect(popup.getAttribute("aria-describedby")).toBe(
    screen.getByText("Choose a name for this project.").id,
  );
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "Name" })).toBe(
      document.activeElement,
    ),
  );
  await user.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

it("supports controlled visibility, custom portals, popup focus options, and dismissal", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger render={<Button />}>Details</Popover.Trigger>
        <Popover.Content
          container={container}
          initialFocus={false}
          aria-label="Details"
          className={(state) => (state.open ? "custom-popover" : undefined)}
        >
          Details
        </Popover.Content>
      </Popover.Root>
    );
  }
  const { unmount } = render(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Details" }));
  const popup = await screen.findByRole("dialog", { name: "Details" });
  expect(container.contains(popup)).toBe(true);
  expect(popup.classList.contains("custom-popover")).toBe(true);
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  unmount();
  container.remove();
});
