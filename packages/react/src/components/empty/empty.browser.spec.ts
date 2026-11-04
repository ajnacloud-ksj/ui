import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Empty content fits a narrow viewport`, async ({ page }) => {
    await openConsumer(page, mode);
    const empty = page.getByTestId("consumer-empty");
    await expect(
      page.getByRole("heading", { name: "Consumer empty projects" }),
    ).toBeVisible();
    await page.setViewportSize({ width: 360, height: 800 });
    const box = (await empty.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
  });
}
