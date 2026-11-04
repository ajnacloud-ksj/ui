import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Progress indeterminate state and reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const progress = page.getByRole("progressbar", { name: "Consumer upload" });
    await expect(progress).toHaveAttribute("aria-valuenow", "6");
    const unknown = page.getByRole("progressbar", {
      name: "Consumer preparing",
    });
    await expect(unknown).not.toHaveAttribute("aria-valuenow");
    const indicator = unknown.locator('[data-slot="progress-sweep"]').first();
    await expect(indicator).toHaveCSS("animation-name", "ajna-progress-travel");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(indicator).toHaveCSS("animation-name", "none");
    await expect(indicator).toBeVisible();
    await expect(
      unknown.locator('[data-slot="progress-sweep"]').nth(1),
    ).toBeHidden();
    await expect(
      unknown.locator('[data-slot="progress-indicator"]').first(),
    ).toHaveCSS("animation-name", "none");
  });
}
