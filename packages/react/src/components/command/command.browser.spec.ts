import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: Command filters aliases, renders indicators, and activates by keyboard`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer commands" });
    const input = region.getByRole("combobox", {
      name: "Consumer inline commands",
    });
    const profile = region.getByRole("option", { name: /Profile/ });
    await expect(
      region
        .getByRole("option", { name: "Dark mode" })
        .locator('[data-slot="command-item-indicator"]'),
    ).toHaveCSS("opacity", "1");
    await input.fill("account");
    await expect(profile).toBeVisible();
    await expect(region.getByRole("option", { name: "Dark mode" })).toHaveCount(
      0,
    );
    await input.press("Enter");
    await expect(
      region.getByRole("status", { name: "Consumer command selection" }),
    ).toHaveText("profile");
    await input.fill("no-match");
    await expect(region.getByText("No consumer commands found.")).toBeVisible();
    await input.clear();
    await input.press("ArrowDown");
    await expect(
      region.getByRole("option", { name: "Dark mode" }),
    ).toHaveAttribute("data-selected", "true");
  });

  test(`${mode}: CommandDialog focuses search, scrolls, selects, and restores focus`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const opener = page.getByRole("button", { name: "Open consumer commands" });
    await opener.click();
    const dialog = page.getByRole("dialog", {
      name: "Consumer command palette",
    });
    const input = dialog.getByRole("combobox", {
      name: "Consumer dialog commands",
    });
    await expect(input).toBeFocused();
    const searchRow = dialog.locator('[data-slot="command-input-wrapper"]');
    await expect(searchRow.locator('[data-slot="input-group"]')).toHaveCount(0);
    const list = dialog.getByRole("listbox");
    await expect(list).toHaveCSS("max-height", "300px");
    await input.press("End");
    const last = dialog.getByRole("option", { name: "Project 40" });
    await expect(last).toHaveAttribute("data-selected", "true");
    await expect
      .poll(() => list.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await input.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(
      page.getByRole("status", { name: "Consumer command selection" }),
    ).toHaveText("Project 40");
    await opener.click();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
}
