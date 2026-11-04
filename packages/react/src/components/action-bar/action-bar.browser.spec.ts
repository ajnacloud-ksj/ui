import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: ActionBar is centered in the viewport, navigates, and restores focus on dismissal`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const opener = page.getByRole("button", {
      name: "Select consumer records",
    });
    await opener.click();
    const bar = page.getByRole("toolbar", {
      name: "Consumer selection actions",
    });
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("position", "fixed");
    await expect(opener).toBeFocused();
    const box = await bar.boundingBox();
    const viewport = page.viewportSize()!;
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThan(
      1,
    );
    expect(Math.abs(viewport.height - box!.y - box!.height - 16)).toBeLessThan(
      1,
    );
    await page.keyboard.press("Tab");
    const archive = bar.getByRole("button", {
      name: "Archive consumer records",
    });
    const exportAction = bar.getByRole("button", {
      name: "Export consumer records",
    });
    await expect(archive).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(exportAction).toBeFocused();
    await page.keyboard.press("Home");
    await expect(archive).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("consumer-action-result")).toHaveText(
      "Archived consumer records",
    );
    await expect(bar).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
      bar.getByRole("button", { name: "Clear consumer selection" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(bar).toHaveCount(0);
    await expect(opener).toBeFocused();
    await opener.click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(bar).toHaveCSS("animation-name", "none");
    await bar.getByRole("button", { name: "Clear consumer selection" }).click();
    await expect(bar).toHaveCount(0);
  });
}
