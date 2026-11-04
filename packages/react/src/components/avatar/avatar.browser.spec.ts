import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Avatar loads its image and displays a fallback`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const image = page.getByRole("img", { name: "Consumer avatar" });
    await expect(image).toBeVisible();
    await expect(image.locator("img")).toBeVisible();
    const fallback = page.getByRole("img", {
      name: "Consumer avatar fallback",
    });
    await expect(fallback).toContainText("AM");
  });
}
