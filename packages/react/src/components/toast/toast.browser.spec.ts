import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Toast default renderer, actions, and an in-place update`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    await page
      .getByRole("button", { name: "Consumer toast", exact: true })
      .click();
    const notification = page.getByRole("dialog", { name: "Consumer saved" });
    await expect(notification).toBeVisible();
    await expect
      .poll(async () => {
        const box = (await notification.boundingBox())!;
        return Math.abs(box.x + box.width - page.viewportSize()!.width + 16);
      })
      .toBeLessThan(2);
    await page.getByRole("button", { name: "Consumer update toast" }).click();
    const updated = page.getByRole("dialog", { name: "Consumer updated" });
    await expect(updated).toBeVisible();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
    await updated.hover();
    await updated.getByRole("button", { name: "Undo save" }).click();
    await expect(page.getByRole("status")).toHaveText("Consumer toast undone");
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });

  test(`${mode}: Toast promise updates loading in place on success and rejection`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", {
      name: "Consumer promise toast",
    });
    await trigger.click();
    const loading = page.getByRole("dialog", { name: "Consumer exporting" });
    await expect(loading).toBeVisible();
    await expect(
      loading.locator('[data-ajna-component="spinner"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await page.getByRole("button", { name: "Resolve consumer export" }).click();
    await expect(
      page.getByRole("dialog", { name: "Consumer export ready" }),
    ).toBeVisible();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
    await page.getByRole("button", { name: "Consumer close toasts" }).click();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    await trigger.click();
    await page.getByRole("button", { name: "Reject consumer export" }).click();
    await expect(
      page.getByRole("dialog", { name: "Consumer export failed" }),
    ).toBeVisible();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
  });

  test(`${mode}: Toast stack limits, expansion, F6, and Escape`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const trigger = page.getByRole("button", { name: "Consumer stack toast" });
    for (let index = 0; index < 4; index++) await trigger.click();
    const roots = page.locator('[data-slot="toast"]');
    await expect(roots).toHaveCount(4);
    await expect(roots.last()).toHaveAttribute("data-limited", "");
    const front = page.getByRole("dialog", { name: "Stack notice 4" });
    await front.hover();
    await expect(front).toHaveAttribute("data-expanded", "");
    await trigger.focus();
    await page.keyboard.press("F6");
    await expect(
      page.getByRole("region", { name: "Notifications" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(front).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Stack notice 4" }),
    ).toHaveCount(0);
  });

  test(`${mode}: Toast mobile width, reduced motion, and swipe dismissal`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openConsumer(page, mode);
    await page
      .getByRole("button", { name: "Consumer toast", exact: true })
      .click();
    const notification = page.getByRole("dialog", { name: "Consumer saved" });
    await expect(notification).toHaveCSS("transition-property", "none");
    await expect
      .poll(async () => (await notification.boundingBox())?.width)
      .toBeCloseTo(328, 0);
    const box = (await notification.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(15);
    await page.mouse.move(box.x + 24, box.y + 24);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 160, box.y + 24, { steps: 10 });
    await page.mouse.up();
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });

  test(`${mode}: Toast timer pauses during hover and resumes afterwards`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openConsumer(page, mode);
    await page.getByRole("button", { name: "Consumer auto toast" }).click();
    const notification = page.getByRole("dialog", {
      name: "Consumer timed notice",
    });
    await notification.hover();
    await page.waitForTimeout(650);
    await expect(notification).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });
}
