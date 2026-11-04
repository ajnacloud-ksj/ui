import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: SearchInput uses InputGroup, clears once, preserves focus, and shows loading`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.getByRole("searchbox", {
      name: "Consumer project search",
    });
    const group = page.locator("#consumer-search-group");
    await input.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(group).not.toHaveCSS("box-shadow", "none");
    await group.getByRole("button", { name: "Clear search" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await input.fill("API");
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
    await page
      .getByRole("button", { name: "Toggle consumer search loading" })
      .click();
    await expect(
      group.locator('[data-ajna-component="spinner"]'),
    ).toBeVisible();
    await expect(
      group.locator('[data-ajna-component="spinner"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await page
      .getByRole("button", { name: "Reset specialized inputs" })
      .click();
    await expect(input).toHaveValue("Website");
    await expect(
      group.getByRole("button", { name: "Clear search" }),
    ).toBeVisible();
  });
}
