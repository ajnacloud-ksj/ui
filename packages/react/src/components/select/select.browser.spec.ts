import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: Select validates, uses keyboard typeahead, submits numeric values, and resets`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer select" });
    const trigger = region.getByRole("combobox", {
      name: "Select project",
      exact: true,
    });
    await region.getByRole("button", { name: "Submit select" }).click();
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    await expect(list).toHaveCSS("overflow-y", "auto");
    await expect(
      page.getByRole("option", { name: "Project 3", exact: true }),
    ).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.type("Project 20");
    await page.keyboard.press("Enter");
    await expect(list).toBeHidden();
    await expect(trigger).toContainText("Project 20");
    await expect(trigger).toBeFocused();
    await region.getByRole("button", { name: "Submit select" }).click();
    await expect(
      region.getByRole("status", { name: "Select submitted" }),
    ).toHaveText("19");
    await region.getByRole("button", { name: "Reset select" }).click();
    await expect(trigger).toContainText("Choose a project");
    await expect(
      region.getByRole("combobox", { name: "Disabled project" }),
    ).toBeDisabled();
  });

  test(`${mode}: Select aligns its selected item and supports native multiple selection`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer select" });
    const aligned = region.getByRole("combobox", { name: "Aligned project" });
    await aligned.click();
    const selected = page.getByRole("option", {
      name: "Project 25",
      exact: true,
    });
    await expect(selected).toBeVisible();
    await expect
      .poll(async () => {
        const a = await aligned
          .locator('[data-slot="select-value"]')
          .boundingBox();
        const b = await selected
          .locator('[data-ajna-component="select-item-text"]')
          .boundingBox();
        return a && b
          ? Math.abs(a.y + a.height / 2 - b.y - b.height / 2)
          : Infinity;
      })
      .toBeLessThan(2);
    await page.keyboard.press("Escape");
    await expect(aligned).toBeFocused();
    const multiple = region.getByRole("combobox", {
      name: "Select projects",
      exact: true,
    });
    await multiple.click();
    await page.getByRole("option", { name: "Project 2", exact: true }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Project 1", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("option", { name: "Project 2", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(multiple).toContainText("Project 1");
    await expect(multiple).toContainText("Project 2");
  });
}
