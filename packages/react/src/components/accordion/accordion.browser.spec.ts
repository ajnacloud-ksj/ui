import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Accordion expansion and reduced motion`, async ({ page }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer accordion" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page.getByTestId("consumer-accordion-content");
    await expect(panel).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(panel).toHaveCSS("transition-property", "none");
  });
}
