import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: NumberInput stepping, bounds, suffix, focus, and submitted value`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.getByLabel("Consumer weight", { exact: true });
    const group = input.locator("..");
    await expect(group.getByText("kg", { exact: true })).toBeVisible();
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("3");
    await expect(group).not.toHaveCSS("box-shadow", "none");
    await group.getByRole("button", { name: "Increase value" }).click();
    await expect(input).toHaveValue("3.5");
    await input.fill("10");
    await input.blur();
    await expect(
      group.getByRole("button", { name: "Increase value" }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Submit specialized inputs" })
      .click();
    await expect(page.getByTestId("consumer-input-result")).toHaveText(
      "10|Website|password supplied",
    );
    await page
      .getByRole("button", { name: "Reset specialized inputs" })
      .click();
    await expect(input).toHaveValue("2.5");
  });
}
