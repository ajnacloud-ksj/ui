import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: PasswordInput reveals without submitting and retains pointer/keyboard focus`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.getByLabel("Consumer account password", { exact: true });
    const group = page.locator("#consumer-password-group");
    await expect(input).toHaveAttribute("type", "password");
    await input.focus();
    await input.evaluate((node) =>
      (node as HTMLInputElement).setSelectionRange(2, 2),
    );
    await group.getByRole("button", { name: "Show password" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("example-password");
    await expect(input).toBeFocused();
    await expect
      .poll(() =>
        input.evaluate((node) => (node as HTMLInputElement).selectionStart),
      )
      .toBe(2);
    await expect(page.getByTestId("consumer-input-result")).toHaveText("");
    await page.keyboard.press("Tab");
    const toggle = group.getByRole("button", { name: "Hide password" });
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(input).toHaveAttribute("type", "password");
    await expect(
      group.getByRole("button", { name: "Show password" }),
    ).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Show unavailable password" }),
    ).toBeDisabled();
  });
}
