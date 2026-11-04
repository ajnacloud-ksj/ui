import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it } from "vitest";

import { Button } from "@/components/button";

import { Tooltip } from ".";

it("describes a composed trigger on keyboard focus and dismisses with Escape", async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button />}>Save</Tooltip.Trigger>
      <Tooltip.Content ref={ref}>Save your changes</Tooltip.Content>
    </Tooltip.Root>,
  );
  const user = userEvent.setup();
  await user.tab();
  const tooltip = await screen.findByRole("tooltip");
  expect(ref.current).toBe(tooltip);
  expect(
    screen
      .getByRole("button", { name: "Save" })
      .getAttribute("aria-describedby"),
  ).toBe(tooltip.id);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  expect(screen.getByRole("button", { name: "Save" })).toBe(
    document.activeElement,
  );
});

it("supports shared hover delays, controlled state, and a custom portal", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <Tooltip.Provider delay={0}>
        <Tooltip.Root open={open} onOpenChange={setOpen}>
          <Tooltip.Trigger render={<Button />}>Details</Tooltip.Trigger>
          <Tooltip.Content
            container={container}
            showArrow={false}
            className={(state) => (state.open ? "custom-tooltip" : undefined)}
          >
            Project details
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }
  const { unmount } = render(<Example />);
  await userEvent.hover(screen.getByRole("button", { name: "Details" }));
  const tooltip = await screen.findByRole("tooltip");
  expect(container.contains(tooltip)).toBe(true);
  expect(tooltip.classList.contains("custom-tooltip")).toBe(true);
  expect(
    tooltip.querySelector('[data-ajna-component="tooltip-arrow"]'),
  ).toBeNull();
  await userEvent.unhover(screen.getByRole("button", { name: "Details" }));
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  unmount();
  container.remove();
});

it("can disable the tooltip without disabling its action", async () => {
  render(
    <Tooltip.Root disabled>
      <Tooltip.Trigger render={<Button />}>Save</Tooltip.Trigger>
      <Tooltip.Content>Save changes</Tooltip.Content>
    </Tooltip.Root>,
  );
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Save" })).toBe(
    document.activeElement,
  );
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("preserves existing descriptions, custom IDs, and canceled state changes", async () => {
  render(
    <>
      <span id="save-help">Saves this project.</span>
      <Tooltip.Root
        onOpenChange={(open, details) => {
          if (!open) details.cancel();
        }}
      >
        <Tooltip.Trigger aria-describedby="save-help" render={<Button />}>
          Save
        </Tooltip.Trigger>
        <Tooltip.Content id="save-tooltip">Save now</Tooltip.Content>
      </Tooltip.Root>
    </>,
  );
  await userEvent.tab();
  await screen.findByRole("tooltip");
  expect(
    screen
      .getByRole("button", { name: "Save" })
      .getAttribute("aria-describedby"),
  ).toBe("save-help save-tooltip");
  await userEvent.keyboard("{Escape}");
  expect(screen.getByRole("tooltip")).toBeTruthy();
});
