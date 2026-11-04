import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: CopyButton supports keyboard copying, focus, and failure feedback`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            document.documentElement.dataset.clipboard = text;
          },
        },
      });
    });
    await openConsumer(page, mode);
    const button = page.getByRole("button", { name: "Copy consumer text" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("data-copy-state", "copied");
    await expect(button).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute(
      "data-clipboard",
      "Ajna clipboard fixture",
    );
    await expect(
      page.getByRole("button", { name: "Copy disabled text" }),
    ).toBeDisabled();
    await expect(button).toHaveAttribute("data-copy-state", "idle");
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
    });
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("data-copy-state", "error");
    await expect(
      page.getByRole("status").filter({ hasText: "Could not copy" }),
    ).toBeAttached();
  });
}
