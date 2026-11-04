import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: RadioGroup selection and keyboard navigation`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const group = page.getByRole("radiogroup", { name: "Consumer plan" });
    const free = group.getByRole("radio", { name: "Free plan" });
    const pro = group.getByRole("radio", { name: "Pro plan" });
    await free.focus();
    await page.keyboard.press("ArrowDown");
    await expect(pro).toBeChecked();
    await expect(free).not.toBeChecked();
  });
}
