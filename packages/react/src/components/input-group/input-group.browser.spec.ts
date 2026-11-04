import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: InputGroup add-ons preserve input focus and tab order`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.getByRole("textbox", { name: "Consumer website" });
    await page.getByText("https://", { exact: true }).click();
    await expect(input).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Clear website" }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await input.fill("example.com");
    await page.getByRole("button", { name: "Clear website" }).click();
    await expect(input).toHaveValue("");
  });
}
