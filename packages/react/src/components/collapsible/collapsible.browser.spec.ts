import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Collapsible keyboard activation and reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer details" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const content = page.getByTestId("consumer-collapsible-content");
    await expect(content).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(content).toHaveCSS("transition-property", "none");
  });
}
