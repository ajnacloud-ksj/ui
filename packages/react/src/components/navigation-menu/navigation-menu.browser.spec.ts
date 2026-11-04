import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: navigation popup, links, and reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer resources" });
    await trigger.click();
    const link = page.getByRole("link", {
      name: "Consumer guide",
      exact: true,
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("aria-current", "page");
    const popup = page.locator('[data-slot="navigation-menu-popup"]');
    const bounds = await popup.boundingBox();
    expect(bounds?.width).toBeGreaterThan(240);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(popup).toHaveCSS("transition-property", "none");
    await link.click();
    await expect(link).toBeHidden();
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(link).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(link).toBeHidden();
  });
}
