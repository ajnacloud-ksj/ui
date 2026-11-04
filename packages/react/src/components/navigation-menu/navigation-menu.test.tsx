import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it } from "vitest";

import { NavigationMenu } from ".";

it("opens a panel, follows a link, and preserves active-page semantics", async () => {
  const root = createRef<HTMLElement>();
  const link = createRef<HTMLAnchorElement>();
  render(
    <NavigationMenu aria-label="Main" ref={root} delay={0}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="docs">
          <NavigationMenu.Trigger>Documentation</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link ref={link} href="#installation" active>
              Installation
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#about">About</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu>,
  );
  expect(root.current).toBe(screen.getByRole("navigation", { name: "Main" }));
  await userEvent.click(screen.getByRole("button", { name: "Documentation" }));
  const installation = await screen.findByRole("link", {
    name: "Installation",
  });
  expect(link.current).toBe(installation);
  expect(installation.getAttribute("aria-current")).toBe("page");
  await userEvent.click(installation);
  await waitFor(() =>
    expect(screen.queryByRole("link", { name: "Installation" })).toBeNull(),
  );
});

it("controls the active panel and supports scoped portals", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  function Example() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <NavigationMenu
        value={value}
        onValueChange={setValue}
        positionerProps={{
          container,
          popupProps: { "aria-label": "Resources" },
        }}
      >
        <NavigationMenu.List>
          <NavigationMenu.Item value="learn">
            <NavigationMenu.Trigger>Learn</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="#guide">Guide</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <output>{value ?? "closed"}</output>
      </NavigationMenu>
    );
  }
  render(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Learn" }));
  expect(await screen.findByText("learn")).toBeTruthy();
  expect(container.contains(screen.getByRole("link", { name: "Guide" }))).toBe(
    true,
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.getByText("closed")).toBeTruthy());
  container.remove();
});
