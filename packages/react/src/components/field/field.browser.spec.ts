import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: FieldLabel required indicator and contextual help preserve control behavior`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const field = page.getByTestId("field-vertical");
    const input = field.getByRole("textbox", {
      name: "Field username",
      exact: true,
    });
    await expect(input).toHaveAttribute("required", "");
    const marker = field.locator('[data-slot="field-required-indicator"]');
    await expect(marker).toHaveText("*");
    await expect(marker).toHaveAttribute("aria-hidden", "true");
    const help = field.getByRole("button", {
      name: "Field username More information",
    });
    await help.focus();
    await page.keyboard.press("Enter");
    const popup = page.getByRole("dialog", {
      name: "Field username",
      exact: true,
    });
    await expect(popup).toBeVisible();
    await expect(popup).toContainText(
      "This public username is visible to other teammates.",
    );
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(help).toBeFocused();
    const horizontal = page.getByTestId("field-horizontal");
    const checkbox = horizontal.getByRole("checkbox", {
      name: "Field choice",
      exact: true,
    });
    await horizontal
      .getByRole("button", { name: "Field choice More information" })
      .click();
    await expect(checkbox).not.toBeChecked();
    await page.keyboard.press("Escape");
    await horizontal.getByText("Field choice", { exact: true }).click();
    await expect(checkbox).toBeChecked();
  });
}
