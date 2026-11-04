import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Spinner inherits color and respects reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const spinner = page.getByRole("status", { name: "Consumer loading" });
    await expect(spinner).toHaveCSS("stroke", "rgb(18, 52, 86)");
    const rotation = spinner.locator("g");
    const arc = rotation.locator("circle");
    await expect(rotation).toHaveCSS("animation-name", "ajna-spinner-rotate");
    await expect(arc).toHaveCSS("animation-name", "ajna-spinner-dash");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(rotation).toHaveCSS("animation-name", "none");
    await expect(arc).toHaveCSS("animation-name", "none");
    const saving = page.getByRole("button", { name: "Saving" });
    await expect(
      saving.locator('[data-ajna-component="spinner"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(saving.getByRole("status")).toHaveCount(0);
  });
}
