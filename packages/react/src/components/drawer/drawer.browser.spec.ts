import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Drawer labels, focus containment, nested dismissal, and focus restoration`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const opener = page.getByRole("button", {
      name: "Open consumer drawer",
      exact: true,
    });
    await opener.click();
    const drawer = page.getByRole("dialog", {
      name: "Consumer drawer",
      exact: true,
    });
    await expect(drawer).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Drawer project name" }),
    ).toBeFocused();
    await expect(drawer).toHaveAttribute("aria-describedby", /.+/);
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press("Tab");
      expect(
        await drawer.evaluate((node) => node.contains(document.activeElement)),
      ).toBe(true);
    }
    await drawer
      .getByRole("button", { name: "Open consumer nested drawer" })
      .click();
    const nested = page.getByRole("dialog", {
      name: "Consumer nested drawer",
      exact: true,
    });
    await expect(nested).toBeVisible();
    await expect(drawer).toHaveAttribute("data-nested-drawer-open", "");
    await page.keyboard.press("Escape");
    await expect(nested).not.toBeVisible();
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("button", { name: "Open consumer nested drawer" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(opener).toBeFocused();
  });

  test(`${mode}: Drawer anchors at each edge, follows its swipe gesture, and respects reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const drawer = page.getByRole("dialog", {
      name: "Consumer drawer",
      exact: true,
    });
    for (const direction of ["down", "up", "left", "right"]) {
      await page
        .getByLabel("Consumer drawer edge", { exact: true })
        .selectOption(direction);
      await page
        .getByRole("button", { name: "Open consumer drawer", exact: true })
        .click();
      await expect(drawer).toBeVisible();
      await expect(drawer).toHaveAttribute("data-swipe-direction", direction);
      const viewport = page.viewportSize()!;
      await expect
        .poll(async () => {
          const box = await drawer.boundingBox();
          if (!box) return Infinity;
          return Math.abs(
            direction === "down"
              ? viewport.height - box.y - box.height
              : direction === "up"
                ? box.y
                : direction === "left"
                  ? box.x
                  : viewport.width - box.x - box.width,
          );
        })
        .toBeLessThan(1);
      await drawer
        .getByRole("button", { name: "Close consumer drawer", exact: true })
        .click();
      await expect(drawer).not.toBeVisible();
    }
    await page
      .getByLabel("Consumer drawer edge", { exact: true })
      .selectOption("down");
    await page
      .getByRole("button", { name: "Open consumer drawer", exact: true })
      .click();
    await expect(drawer).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(drawer).toHaveCSS("transition-property", "none");
    const grip = drawer.locator('[data-slot="drawer-swipe-handle"]');
    const box = await grip.boundingBox();
    const viewport = page.viewportSize()!;
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, viewport.height - 2, {
      steps: 12,
    });
    await page.mouse.up();
    await expect(drawer).not.toBeVisible();
  });

  test(`${mode}: snap state, non-modal outside interaction, and root theme overrides`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    await page
      .getByRole("button", { name: "Open consumer snap drawer" })
      .click();
    const drawer = page.getByRole("dialog", {
      name: "Consumer drawer",
      exact: true,
    });
    await expect(drawer).toHaveAttribute("data-snap-points", "");
    await expect(drawer).not.toHaveAttribute("data-expanded", "");
    await drawer
      .getByRole("button", { name: "Expand consumer drawer" })
      .click();
    await expect(drawer).toHaveAttribute("data-expanded", "");
    await page.evaluate(() =>
      document.documentElement.style.setProperty(
        "--ajna-popover",
        "120 100% 25%",
      ),
    );
    await expect(drawer).toHaveCSS("background-color", "rgb(0, 128, 0)");
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await page
      .getByLabel("Consumer drawer mode", { exact: true })
      .selectOption("non-modal");
    await page
      .getByLabel("Consumer drawer edge", { exact: true })
      .selectOption("right");
    await page
      .getByRole("button", { name: "Open consumer drawer", exact: true })
      .click();
    await expect(drawer).toBeVisible();
    await expect(page.locator('[data-slot="drawer-overlay"]')).toHaveCount(0);
    await page
      .getByRole("button", { name: "Drawer background count: 0" })
      .click();
    await expect(
      page.getByRole("button", { name: "Drawer background count: 1" }),
    ).toBeVisible();
    await expect(drawer).toBeVisible();
    await drawer
      .getByRole("button", { name: "Close consumer drawer", exact: true })
      .click();
    await expect(drawer).not.toBeVisible();
  });
}
