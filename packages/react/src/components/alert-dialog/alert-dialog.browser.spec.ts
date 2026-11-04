import { expect, test } from "@playwright/test";

import {
  consumerModes,
  expectCentered,
  openConsumer,
} from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: alert dialog focus, placement, and dismissal`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", {
      name: "Consumer alert dialog",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("alertdialog", {
      name: "Consumer archive project",
    });
    await expect(dialog).toBeVisible();
    await dialog.evaluate((element) => {
      element.style.margin = "0";
    });
    await expectCentered(dialog, page);
    await expect(
      page.getByRole("button", { name: "Cancel archive" }),
    ).toBeFocused();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Cancel archive" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("button", { name: "Confirm archive" }).click();
    await expect(dialog).toBeHidden();
  });
}

for (const mode of consumerModes) {
  test(`${mode}: tall alerts grow naturally and scroll their viewport`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    await page.setViewportSize({ width: 320, height: 568 });
    await page
      .getByRole("button", { name: "Consumer alert dialog", exact: true })
      .click();
    const dialog = page.getByRole("alertdialog", {
      name: "Consumer archive project",
    });
    await expect(dialog).toBeVisible();
    await dialog.evaluate((element) => {
      const content = document.createElement("p");
      content.textContent = "Long confirmation details. ".repeat(200);
      element.insertBefore(content, element.lastElementChild);
    });
    await expect(dialog).toHaveCSS("max-height", "none");
    expect((await dialog.boundingBox())!.height).toBeGreaterThan(568);
    const viewport = page.locator('[data-slot="alert-dialog-viewport"]');
    await dialog
      .getByRole("button", { name: "Confirm archive" })
      .scrollIntoViewIfNeeded();
    expect(
      await viewport.evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    await dialog.getByRole("button", { name: "Cancel archive" }).click();
    await expect(dialog).toBeHidden();
  });
}
