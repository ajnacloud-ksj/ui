import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Popover focus, placement, and outside dismissal`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer popover" });
    await trigger.click();
    const popup = page.getByRole("dialog", { name: "Consumer project" });
    await expect(popup).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Popover name" }),
    ).toBeFocused();
    const anchor = await trigger.boundingBox();
    await expect
      .poll(async () => (await popup.boundingBox())?.y ?? -Infinity)
      .toBeGreaterThan(anchor!.y + anchor!.height);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(popup).toHaveCSS("transition-property", "none");
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(popup).toBeHidden();
  });
}
