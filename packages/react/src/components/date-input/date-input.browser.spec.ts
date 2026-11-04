import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

test.use({ timezoneId: "UTC" });

for (const mode of consumerModes) {
  test(`${mode}: date segments handle leap days and clear focus`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.locator('[data-slot="date-input"]', {
      has: page.getByRole("group", { name: "Consumer date input" }),
    });
    const day = input.getByRole("spinbutton", { name: /^day/i });
    await day.focus();
    await page.keyboard.press("ArrowUp");
    await expect(day).toHaveAttribute("aria-valuenow", "29");
    await input.getByRole("button", { name: "Clear date" }).click();
    await expect(input.getByRole("spinbutton").first()).toBeFocused();
  });
}

for (const mode of consumerModes) {
  test(`${mode}: calendar aligns with the full input and supports year/month selection`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const input = page.locator('[data-slot="date-input-group"]').filter({
      has: page.getByRole("spinbutton", {
        name: /month, Consumer date picker/,
      }),
    });
    const trigger = input.locator('[data-slot="date-input-trigger"]');
    await trigger.click();
    const popup = page.getByRole("dialog", { name: "Choose date" });
    await expect(popup).toBeVisible();
    await expect
      .poll(async () => {
        const field = await input.boundingBox();
        const calendar = await popup.boundingBox();
        return field && calendar ? Math.abs(field.x - calendar.x) : Infinity;
      })
      .toBeLessThan(1);
    await expect(
      popup.getByRole("button", { name: /April 12, 2026/ }),
    ).toBeFocused();
    await popup
      .getByRole("button", { name: "April 2026", exact: true })
      .click();
    const years = popup.getByRole("listbox");
    expect(
      await years.evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(" ").length,
      ),
    ).toBe(3);
    await expect(
      years.getByRole("option", { name: "2026", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await years.getByRole("option", { name: "2027", exact: true }).click();
    await popup.locator('button[slot="next"]').click();
    await popup.locator('button[slot="next"]').click();
    await popup.getByRole("button", { name: /June 18, 2027/ }).click();
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.getByRole("button", { name: "Submit consumer date" }).click();
    await expect(
      page.getByRole("status", { name: "Consumer submitted date" }),
    ).toHaveText("2027-06-18");
  });

  test(`${mode}: calendar uses logical start alignment in RTL and fits a narrow viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConsumer(page, mode);
    const input = page.locator('[data-slot="date-input-group"]').filter({
      has: page
        .getByRole("spinbutton", { name: /Consumer RTL date picker/ })
        .first(),
    });
    await input.locator('[data-slot="date-input-trigger"]').click();
    const popup = page.getByRole("dialog", { name: "Choose date" });
    await expect(popup).toHaveCSS("direction", "rtl");
    await expect
      .poll(async () => {
        const field = await input.boundingBox();
        const calendar = await popup.boundingBox();
        return field && calendar
          ? Math.abs(field.x + field.width - calendar.x - calendar.width)
          : Infinity;
      })
      .toBeLessThan(1);
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
  });
}

for (const mode of consumerModes) {
  test(`${mode}: Today selects the current day, closes, and returns focus`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-04-16T12:00:00Z"));
    await openConsumer(page, mode);
    const input = page.locator('[data-slot="date-input-group"]').filter({
      has: page.getByRole("spinbutton", {
        name: /month, Consumer date picker/,
      }),
    });
    const trigger = input.locator('[data-slot="date-input-trigger"]');
    await trigger.click();
    const popup = page.getByRole("dialog", { name: "Choose date" });
    await popup.getByRole("button", { name: "Today", exact: true }).click();
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.getByRole("button", { name: "Submit consumer date" }).click();
    await expect(
      page.getByRole("status", { name: "Consumer submitted date" }),
    ).toHaveText("2026-04-16");
    await trigger.click();
    await expect(
      popup.getByRole("button", { name: "Today", exact: true }),
    ).toHaveCount(0);
  });
}
