import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Tooltip positioning, keyboard access, and motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer tooltip" });
    await trigger.focus();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    const anchor = await trigger.boundingBox();
    await expect
      .poll(async () => (await tooltip.boundingBox())?.y ?? Infinity)
      .toBeLessThan(anchor!.y);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(tooltip).toHaveCSS("transition-property", "none");
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
