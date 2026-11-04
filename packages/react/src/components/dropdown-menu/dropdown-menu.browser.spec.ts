import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Dropdown Menu keyboard, settings, submenu, and motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer menu" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const checkbox = page.getByRole("menuitemcheckbox", {
      name: "Show activity",
    });
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await expect(menu).toBeVisible();
    await page.getByRole("menuitem", { name: "Share project" }).hover();
    await expect(
      page.getByRole("menuitem", { name: "Copy project link" }),
    ).toBeVisible();
    await page.getByRole("menuitem", { name: "Copy project link" }).focus();
    await page.keyboard.press("Escape");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("menu").first()).toHaveCSS(
      "transition-property",
      "none",
    );
    await page.getByRole("menuitem", { name: "Rename project" }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
