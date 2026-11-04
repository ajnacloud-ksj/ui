import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Toggle keyboard state, focus, and reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const toggle = page.getByRole("button", { name: "Consumer bookmark" });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveClass(/consumer-pressed/);
    await expect(toggle).not.toHaveCSS("box-shadow", "none");
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByRole("button", { name: "Consumer disabled toggle" }),
    ).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(toggle).toHaveCSS("transition-property", "none");
  });
}
