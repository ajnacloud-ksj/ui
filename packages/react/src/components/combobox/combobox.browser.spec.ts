import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: Combobox selects IDs, validates, aligns its popup, and keeps the footer visible`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer combobox" });
    const input = region.getByRole("combobox", {
      name: "Consumer project",
      exact: true,
    });
    await input.scrollIntoViewIfNeeded();
    await region.getByRole("button", { name: "Submit combobox" }).click();
    await expect(input).toBeFocused();
    await input.fill("Project 2");
    const popup = page.locator('[data-slot="combobox-content"]');
    await expect(popup).toBeVisible();
    const empty = popup.locator('[data-slot="combobox-empty"]');
    await expect(empty).toHaveCSS("padding-top", "0px");
    await expect(empty).toHaveCSS("padding-bottom", "0px");
    await expect(empty).toHaveCSS("height", "0px");
    const control = input.locator(
      'xpath=ancestor::*[@data-slot="input-group"]',
    );
    await expect
      .poll(async () => {
        const a = await control.boundingBox();
        const b = await popup.boundingBox();
        return a && b
          ? Math.max(Math.abs(a.x - b.x), Math.abs(a.width - b.width))
          : Infinity;
      })
      .toBeLessThan(2);
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(popup).toBeHidden();
    await region.getByRole("button", { name: "Submit combobox" }).click();
    await expect(
      region.getByRole("status", { name: "Combobox submitted" }),
    ).toHaveText("1");
    await region
      .getByRole("button", { name: "Toggle combobox results" })
      .click();
    await expect(
      region.locator('[data-ajna-component="combobox-selected-value"]').first(),
    ).toHaveText("Project 2");
    await region
      .getByRole("button", { name: "Toggle combobox results" })
      .click();
    await input.click();
    await input.press("ArrowDown");
    const list = page.getByRole("listbox");
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const footer = page.getByRole("button", { name: "Finish choosing" });
    await expect(footer).toBeInViewport();
    const blurBefore = await region
      .locator('output[aria-label="Combobox blur count"]')
      .textContent();
    await input.press("Tab");
    await expect(footer).toBeFocused();
    await expect(
      region.locator('output[aria-label="Combobox blur count"]'),
    ).toHaveText(blurBefore!);
    await footer.click();
    await expect(input).toBeFocused();
    await expect(popup).toBeHidden();
    await region
      .getByRole("button", { name: "Toggle combobox loading" })
      .click();
    await input.click();
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText(/Loading…/)).toBeVisible();
    await input.press("Escape");
  });

  test(`${mode}: Combobox supports pill overflow and the manual styled parts`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer combobox" });
    const multiple = region.getByRole("combobox", {
      name: "Consumer projects",
      exact: true,
    });
    const control = multiple.locator(
      'xpath=ancestor::*[@data-slot="input-group"]',
    );
    await expect(control.getByText("+1", { exact: true })).toBeVisible();
    await control.getByRole("button", { name: "Remove Project 1" }).click();
    await expect(control.getByText("+1", { exact: true })).toHaveCount(0);
    await control.getByRole("button", { name: "Clear selection" }).click();
    await expect(control.getByRole("button", { name: /^Remove / })).toHaveCount(
      0,
    );
    const manual = region.getByRole("combobox", { name: "Composed project" });
    await manual.fill("bet");
    await expect(page.getByRole("option")).toHaveCount(1);
    await manual.press("ArrowDown");
    await manual.press("Enter");
    await expect(manual).toHaveValue("Beta");
  });
}
