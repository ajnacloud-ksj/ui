import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Checkbox labels and keyboard state`, async ({ page }) => {
    await openConsumer(page, mode);
    const checkbox = page.getByRole("checkbox", { name: "Consumer terms" });
    await page.getByText("Consumer terms", { exact: true }).click();
    await expect(checkbox).toBeChecked();
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "Mixed checkbox" }),
    ).toHaveAttribute("aria-checked", "mixed");
    await expect(
      page.getByRole("checkbox", { name: "Disabled checkbox" }),
    ).toBeDisabled();
  });
}
