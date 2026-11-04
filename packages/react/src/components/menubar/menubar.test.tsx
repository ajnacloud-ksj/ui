import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Menubar } from ".";

it("moves between menu triggers and invokes commands", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  render(
    <Menubar aria-label="Editor">
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item onClick={select}>New file</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>Undo</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar>,
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "File" }),
  );
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "Edit" }),
  );
  await user.keyboard("{ArrowLeft}{ArrowDown}");
  const item = await screen.findByRole("menuitem", { name: "New file" });
  await user.click(item);
  expect(select).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
});

it("supports checkbox and radio menu state", async () => {
  const checked = vi.fn();
  const value = vi.fn();
  render(
    <Menubar>
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.CheckboxItem
            defaultChecked
            onCheckedChange={checked}
            closeOnClick={false}
          >
            Toolbar
          </Menubar.CheckboxItem>
          <Menubar.RadioGroup defaultValue="comfortable" onValueChange={value}>
            <Menubar.RadioItem value="comfortable">
              Comfortable
            </Menubar.RadioItem>
            <Menubar.RadioItem value="compact">Compact</Menubar.RadioItem>
          </Menubar.RadioGroup>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar>,
  );
  act(() => screen.getByRole("menuitem", { name: "View" }).focus());
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.click(
    await screen.findByRole("menuitemcheckbox", { name: "Toolbar" }),
  );
  expect(checked.mock.calls[0]?.[0]).toBe(false);
  await userEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
  expect(value.mock.calls[0]?.[0]).toBe("compact");
});
