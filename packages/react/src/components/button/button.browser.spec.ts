import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test.describe(mode, () => {
    test.beforeEach(async ({ page }) => {
      await openConsumer(page, mode);
    });

    test("consumer utility isolation and overrides", async ({ page }) => {
      const consumer = page.getByTestId("unrelated-utility");
      if (mode !== "tailwind") {
        await expect(consumer).toHaveCSS(
          "background-color",
          "rgba(0, 0, 0, 0)",
        );
      } else {
        await expect(consumer).toHaveCSS("height", "36px");
        const button = page.getByRole("button", { name: "Custom dimensions" });
        await expect(button).toHaveCSS("height", "48px");
        await expect(button).toHaveCSS("padding-left", "24px");
        await expect(button).toHaveCSS("background-color", "rgb(18, 52, 86)");
      }
      if (mode === "tailwind-v4") {
        await consumer.evaluate((element) =>
          element.classList.add("-translate-x-1/2"),
        );
        await expect(consumer).not.toHaveCSS("translate", "none");
      }
    });

    test("Button loading protection and keyboard activation", async ({
      page,
    }) => {
      const button = page.getByRole("button", { name: "Count 0" });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Count 1" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Saving" })).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Unavailable", exact: true }),
      ).toBeDisabled();
    });
  });
}
