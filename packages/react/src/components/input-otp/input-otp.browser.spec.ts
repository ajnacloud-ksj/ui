import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: OTP entry, slots, paste, and native submission`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.getByRole("textbox", {
      name: "Consumer verification code",
    });
    await input.focus();
    await input.pressSequentially("1a23456");
    await expect(input).toHaveValue("123456");
    await input.press("Backspace");
    await expect(input).toHaveValue("12345");
    await input.fill("");
    await input.evaluate((node) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", "654-321");
      node.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await expect(input).toHaveValue("654321");
    await page.getByRole("button", { name: "Submit consumer code" }).click();
    await expect(
      page.getByRole("status", { name: "Submitted consumer code" }),
    ).toHaveText("654321");
  });
}
