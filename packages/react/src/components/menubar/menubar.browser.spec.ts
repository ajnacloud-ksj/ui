import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: menubar navigation, preferences, and submenus`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const bar = page.getByRole("menubar", { name: "Consumer editor" });
    await bar
      .getByRole("menuitem", { name: "Consumer File", exact: true })
      .focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      bar.getByRole("menuitem", { name: "Consumer Edit" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowDown");
    const checkbox = page.getByRole("menuitemcheckbox", {
      name: "Consumer toolbar",
    });
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await page.getByRole("menuitem", { name: "Consumer share" }).hover();
    const invite = page.getByRole("menuitem", { name: "Consumer invite" });
    await expect(invite).toBeVisible();
    await invite.click();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
}
