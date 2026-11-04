import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

test.use({ hasTouch: true });

for (const mode of consumerModes) {
  test(`${mode}: Sidebar controls use page or panel colors according to placement`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer sidebar" });
    const panel = region.locator('aside[data-sidebar="sidebar"]');
    const inside = panel.locator('[data-sidebar="trigger"]');
    const outside = region.locator('[data-sidebar="trigger"]').last();
    const close = panel.getByRole("button", { name: "Close navigation" });
    for (const [muted, foreground, panelForeground] of [
      ["rgb(95, 95, 95)", "rgb(15, 15, 15)", "rgb(226, 226, 226)"],
      ["rgb(146, 146, 146)", "rgb(235, 235, 235)", "rgb(235, 235, 235)"],
    ]) {
      await page.mouse.move(0, 0);
      await expect(outside).toHaveCSS("color", muted);
      await expect(outside.locator("..")).toHaveCSS("color", foreground);
      await expect(close).toHaveCSS("color", panelForeground);
      await inside.hover();
      await expect(inside).toHaveCSS("color", panelForeground);
      await outside.hover();
      await expect(outside).toHaveCSS("color", foreground);
      await page
        .getByRole("button", { name: "Toggle theme", exact: true })
        .click();
    }
  });

  test(`${mode}: Sidebar keeps its rail, collapsed icons, and footer aligned on either side`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer sidebar" });
    for (const side of ["left", "right"] as const) {
      await region.getByLabel("Consumer sidebar side").selectOption(side);
      const panel = region.locator('aside[data-sidebar="sidebar"]');
      const surface = panel.locator('[data-sidebar="content-container"]');
      const header = panel.locator('[data-sidebar="header"]');
      await expect(header).toHaveCSS("height", "56px");
      await region
        .getByRole("button", { name: "Collapse sidebar" })
        .first()
        .click();
      await expect(panel).toHaveCSS("width", "57px");
      const overview = panel.getByRole("button", {
        name: "Overview",
        exact: true,
      });
      await expect(overview).toBeVisible();
      await expect
        .poll(async () => {
          const bounds = await surface.boundingBox();
          const rail = await panel
            .locator('[data-sidebar="rail"]')
            .boundingBox();
          const icon = await overview
            .locator('[aria-hidden="true"]')
            .first()
            .boundingBox();
          const footer = await panel
            .locator('[data-sidebar="footer"]')
            .boundingBox();
          if (!bounds || !rail || !icon || !footer) return Infinity;
          const edge = side === "left" ? bounds.x + bounds.width : bounds.x;
          return Math.max(
            Math.abs(rail.x + rail.width / 2 - edge),
            Math.abs(icon.x + icon.width / 2 - bounds.x - bounds.width / 2),
            Math.max(0, footer.x + footer.width - bounds.x - bounds.width),
          );
        })
        .toBeLessThan(1.1);
      await region
        .getByRole("button", { name: "Expand sidebar" })
        .first()
        .click();
      await expect(panel).toHaveCSS("width", "240px");
    }
  });

  test(`${mode}: Sidebar collapses, resizes, scrolls, and reads theme variables`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer sidebar" });
    const panel = region.locator('aside[data-sidebar="sidebar"]');
    await expect(panel).toHaveCSS("width", "240px");
    await region
      .getByRole("button", { name: "Collapse sidebar" })
      .first()
      .click();
    await expect(panel).toHaveCSS("width", "57px");
    await region
      .getByRole("button", { name: "Expand sidebar" })
      .first()
      .click();
    const handle = region.getByRole("button", { name: "Resize sidebar" });
    await handle.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      region.getByRole("status", { name: "Sidebar width" }),
    ).toHaveText("250");
    await page.keyboard.press("End");
    await expect(panel).toHaveCSS("width", "360px");
    await region.getByRole("button", { name: "Consumer projects" }).click();
    await expect(
      region.getByRole("button", { name: "Nested destination" }),
    ).toBeVisible();
    await region.getByRole("button", { name: "Jump to sidebar end" }).click();
    await expect
      .poll(() =>
        region
          .locator('[data-sidebar="viewport"]')
          .evaluate((element) => element.scrollTop),
      )
      .toBeGreaterThan(0);
    const surface = panel.locator('[data-sidebar="content-container"]');
    const before = await surface.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await region.getByRole("button", { name: "Change sidebar color" }).click();
    await expect
      .poll(() =>
        surface.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      )
      .not.toBe(before);
    await expect(surface).toHaveCSS("background-color", "rgb(26, 77, 51)");
  });

  test(`${mode}: Mobile Sidebar traps focus and restores its opener`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer sidebar" });
    const opener = region.getByRole("button", { name: "Expand sidebar" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Consumer navigation" });
    await expect(dialog).toBeVisible();
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement)),
      )
      .toBe(true);
    await page.keyboard.press("Shift+Tab");
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement)),
      )
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await opener.click();
    await dialog.getByRole("button", { name: "Close navigation" }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test(`${mode}: Mobile Sidebar follows directional touch gestures and preserves navigation scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Consumer sidebar" });
    for (const side of ["left", "right"] as const) {
      await region.getByLabel("Consumer sidebar side").selectOption(side);
      await region
        .getByLabel("Full-width consumer sidebar")
        .setChecked(side === "right");
      const opener = region.getByRole("button", { name: "Expand sidebar" });
      await opener.click();
      const panel = page.getByRole("dialog", { name: "Consumer navigation" });
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute("data-swipe-direction", side);
      const scrollRegion = panel.locator('[data-sidebar="viewport"]');
      await scrollRegion.hover();
      await page.mouse.wheel(0, 300);
      await expect
        .poll(() => scrollRegion.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
      await expect(panel).toBeVisible();
      const header = panel.locator('[data-sidebar="header"]');
      const box = await header.boundingBox();
      const startX = side === "left" ? box!.x + box!.width - 30 : box!.x + 30;
      const endX = side === "left" ? box!.x + 30 : box!.x + box!.width - 30;
      const y = box!.y + box!.height / 2;
      const touch = (x: number) => ({
        identifier: 1,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        screenX: x,
        screenY: y,
      });
      await header.dispatchEvent("touchstart", {
        touches: [touch(startX)],
        changedTouches: [touch(startX)],
      });
      await header.dispatchEvent("touchmove", {
        touches: [touch(startX + (endX - startX) * 0.25)],
      });
      await header.dispatchEvent("touchmove", { touches: [touch(endX)] });
      await expect(panel).toHaveAttribute("data-swiping", "");
      await expect
        .poll(() =>
          panel.evaluate((element) =>
            Math.abs(
              Number.parseFloat(
                element.style.getPropertyValue("--drawer-swipe-movement-x"),
              ),
            ),
          ),
        )
        .toBeGreaterThan(20);
      await header.dispatchEvent("touchend", {
        touches: [],
        changedTouches: [touch(endX)],
      });
      await expect(panel).toBeHidden();
      await expect(opener).toBeFocused();
    }
  });
}
