import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Switch keyboard state, thumb travel, and RTL`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const control = page.getByRole("switch", { name: "Consumer updates" });
    const thumb = control.locator('[data-ajna-component="switch-thumb"]');
    const start = (await thumb.boundingBox())!;
    await page.getByText("Consumer updates", { exact: true }).click();
    await expect(control).toBeChecked();
    await expect
      .poll(async () => (await thumb.boundingBox())!.x)
      .toBeGreaterThan(start.x);
    await control.focus();
    await page.keyboard.press("Space");
    await expect(control).not.toBeChecked();
    await expect(
      page.getByRole("switch", { name: "Disabled switch" }),
    ).toBeDisabled();
    const rtl = page.getByRole("switch", { name: "RTL switch" });
    const rtlThumb = rtl.locator('[data-ajna-component="switch-thumb"]');
    const rtlStart = (await rtlThumb.boundingBox())!;
    await rtl.click();
    await expect
      .poll(async () => (await rtlThumb.boundingBox())!.x)
      .toBeLessThan(rtlStart.x);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(thumb).toHaveCSS("transition-property", "none");
  });
}
