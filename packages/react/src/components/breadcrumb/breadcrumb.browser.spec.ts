import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Breadcrumb semantics, focus, and collapsed path`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const breadcrumb = page.getByRole("navigation", {
      name: "Consumer location",
    });
    await expect(breadcrumb.getByRole("list")).toHaveCSS(
      "list-style-type",
      "none",
    );
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
      "Consumer current page",
    );
    await expect(breadcrumb.getByRole("listitem")).toHaveCount(3);
    const link = breadcrumb.getByRole("link", { name: "Consumer home" });
    await page.keyboard.press("Tab");
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).not.toHaveCSS("box-shadow", "none");
    const trigger = page.getByRole("button", { name: "Consumer hidden path" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("menuitem", { name: "Consumer parent" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}
