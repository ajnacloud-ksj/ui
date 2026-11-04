import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "@/components/button";

import { DropdownMenu } from ".";

it("keeps disabled actions discoverable without activation and restores focus after an enabled action", async () => {
  const onClick = vi.fn();
  const onDisabledClick = vi.fn();
  const ref = createRef<HTMLElement>();
  render(
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button />}>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Project</DropdownMenu.Label>
          <DropdownMenu.Item>Rename</DropdownMenu.Item>
          <DropdownMenu.Item disabled onClick={onDisabledClick}>
            Unavailable
          </DropdownMenu.Item>
          <DropdownMenu.Item ref={ref} onClick={onClick}>
            Duplicate
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Actions" });
  await user.tab();
  await user.keyboard("{ArrowDown}");
  await screen.findByRole("menu");
  expect(ref.current).toBe(screen.getByRole("menuitem", { name: "Duplicate" }));
  await waitFor(() =>
    expect(
      screen
        .getByRole("menuitem", { name: "Rename" })
        .hasAttribute("data-highlighted"),
    ).toBe(true),
  );
  await user.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(
      screen
        .getByRole("menuitem", { name: "Unavailable" })
        .hasAttribute("data-highlighted"),
    ).toBe(true),
  );
  await user.keyboard("{Enter}");
  expect(onDisabledClick).not.toHaveBeenCalled();
  expect(screen.getByRole("menu")).toBeTruthy();
  await user.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(
      screen
        .getByRole("menuitem", { name: "Duplicate" })
        .hasAttribute("data-highlighted"),
    ).toBe(true),
  );
  await user.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

it("preserves controlled checkbox and radio state without closing settings by default", async () => {
  function Settings() {
    const [checked, setChecked] = useState(false);
    const [value, setValue] = useState("light");
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger render={<Button />}>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            checked={checked}
            onCheckedChange={setChecked}
          >
            Show activity
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.RadioGroup
            value={value}
            onValueChange={setValue}
            aria-label="Theme"
          >
            <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="dark">Dark</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }
  render(<Settings />);
  await userEvent.click(screen.getByRole("button", { name: "View" }));
  const checkbox = await screen.findByRole("menuitemcheckbox", {
    name: "Show activity",
  });
  await userEvent.click(checkbox);
  expect(checkbox.getAttribute("aria-checked")).toBe("true");
  await userEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
  expect(
    screen
      .getByRole("menuitemradio", { name: "Dark" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    screen
      .getByRole("menuitemradio", { name: "Light" })
      .getAttribute("aria-checked"),
  ).toBe("false");
  expect(screen.getByRole("menu")).toBeTruthy();
});

it("opens submenus by keyboard and closes the menu tree after an action", async () => {
  const onClick = vi.fn();
  render(
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button />}>Share</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Invite</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onClick={onClick}>Email</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  const submenuTrigger = await screen.findByRole("menuitem", {
    name: "Invite",
  });
  await userEvent.keyboard("{Home}");
  await waitFor(() => expect(document.activeElement).toBe(submenuTrigger));
  await userEvent.keyboard("{ArrowRight}");
  const item = await screen.findByRole("menuitem", { name: "Email" });
  await userEvent.click(item);
  expect(onClick).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryAllByRole("menu")).toHaveLength(0));
});

it("keeps native links and shortcut hints, and supports custom portals", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const { unmount } = render(
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button />}>Project</DropdownMenu.Trigger>
      <DropdownMenu.Content container={container}>
        <DropdownMenu.LinkItem href="#project">
          Project overview
        </DropdownMenu.LinkItem>
        <DropdownMenu.Item variant="destructive">
          Delete<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Project" }));
  const menu = await screen.findByRole("menu");
  expect(container.contains(menu)).toBe(true);
  expect(
    screen
      .getByRole("menuitem", { name: "Project overview" })
      .getAttribute("href"),
  ).toBe("#project");
  expect(
    screen
      .getByRole("menuitem", { name: "Delete" })
      .getAttribute("data-variant"),
  ).toBe("destructive");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  unmount();
  container.remove();
});
