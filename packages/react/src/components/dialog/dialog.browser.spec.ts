import { expect, test } from "@playwright/test";

import {
  consumerModes,
  expectCentered,
  openConsumer,
} from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test.describe(mode, () => {
    test.beforeEach(async ({ page }) => {
      await openConsumer(page, mode);
    });

    test("dialog labels, focus containment, Escape, and focus restoration", async ({
      page,
    }) => {
      const trigger = page.getByRole("button", { name: "Open settings" });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Project settings" });
      await expect(dialog).toBeVisible();
      await expectCentered(dialog, page);
      if (mode === "tailwind-v4") {
        for (const property of ["translate", "rotate", "scale"])
          await expect(dialog).toHaveCSS(property, "none");
      }
      await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
      await expect(
        page.getByRole("textbox", { name: "Project name" }),
      ).toBeFocused();
      for (let index = 0; index < 7; index++) {
        await page.keyboard.press("Tab");
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });

    test("viewport centers the dialog independently of popup margins", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Open settings" }).click();
      const dialog = page.getByRole("dialog", { name: "Project settings" });
      await expect(dialog).toBeVisible();
      await dialog.evaluate((element) => {
        element.style.margin = "0";
      });
      await expectCentered(dialog, page);
      await page.setViewportSize({ width: 900, height: 760 });
      await expectCentered(dialog, page);
    });

    test("backdrop dismisses and modal scroll is locked", async ({ page }) => {
      await page.getByRole("button", { name: "Open settings" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.mouse.move(5, 5);
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
      await page.mouse.click(5, 5);
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("root theme changes reach portaled content and custom tokens work", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Open settings" }).click();
      const dialog = page.getByRole("dialog");
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.evaluate(() =>
        document.documentElement.style.setProperty(
          "--ajna-card",
          "120 100% 25%",
        ),
      );
      await expect(dialog).toHaveCSS("background-color", "rgb(0, 128, 0)");
    });

    test("theme aliases work in both directions across light and dark modes", async ({
      page,
    }) => {
      const button = page.getByRole("button", { name: "Count 0" });
      const applicationTheme = await page.addStyleTag({
        content: `
        :root { --primary: 120 100% 25%; }
        :root.dark { --primary: 240 100% 25%; }
        :root, :root.dark {
          --ajna-primary: var(--primary);
        }
      `,
      });
      await expect(button).toHaveCSS("background-color", "rgb(0, 128, 0)");
      await button.hover();
      await expect(button).toHaveCSS("background-color", "rgb(0, 128, 0)");
      await page.getByRole("button", { name: "Toggle theme" }).click();
      await expect(button).toHaveCSS("background-color", "rgb(0, 0, 128)");
      await applicationTheme.evaluate((element) => {
        element.parentNode?.removeChild(element);
      });

      await page.addStyleTag({
        content: `
        :root, :root.dark { --application-card: var(--ajna-card); }
        #theme-probe { background-color: hsl(var(--application-card)); }
      `,
      });
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.id = "theme-probe";
        document.body.appendChild(probe);
      });
      await page.getByRole("button", { name: "Open settings" }).click();
      const dialog = page.getByRole("dialog");
      const probe = page.locator("#theme-probe");
      for (const dark of [false, true]) {
        await page.evaluate(
          (enabled) =>
            document.documentElement.classList.toggle("dark", enabled),
          dark,
        );
        const color = await dialog.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        );
        await expect(probe).toHaveCSS("background-color", color);
      }
      await page.addStyleTag({
        content: ":root, :root.dark { --ajna-card: 120 100% 25%; }",
      });
      await expect(dialog).toHaveCSS("background-color", "rgb(0, 128, 0)");
      await expect(probe).toHaveCSS("background-color", "rgb(0, 128, 0)");
    });

    test("small screens scroll long dialogs and respect reduced motion", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.getByRole("button", { name: "Open settings" }).click();
      const dialog = page.getByRole("dialog");
      await expectCentered(dialog, page);
      await page.getByTestId("long-content").evaluate((element) => {
        element.style.display = "block";
      });
      const viewport = page.locator('[data-slot="dialog-viewport"]');
      await expect(dialog).toHaveCSS("max-height", "none");
      const box = await dialog.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(288);
      expect(box!.height).toBeGreaterThan(568);
      expect(box!.y).toBeGreaterThanOrEqual(16);
      expect(
        await viewport.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      ).toBe(true);
      await dialog
        .getByText("Project detail 79", { exact: true })
        .scrollIntoViewIfNeeded();
      expect(
        await viewport.evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      await expect(dialog).toHaveCSS("transition-property", "none");
    });
  });
}
