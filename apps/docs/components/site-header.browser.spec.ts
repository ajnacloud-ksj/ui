import { expect, test } from "@playwright/test";

test("mobile docs navigation opens from the left and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Open documentation sidebar" })
    .click();
  const drawer = page.locator("#nd-sidebar-mobile");
  await expect(drawer).toBeVisible();
  await expect.poll(async () => (await drawer.boundingBox())?.x ?? -1).toBe(0);
  const bounds = await drawer.boundingBox();
  expect(bounds!.width).toBeGreaterThan(200);
  expect(bounds!.width).toBeLessThan(375);
  await drawer.getByRole("link", { name: "Installation", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/installation$/);
  await expect(drawer).toBeHidden();
});

test("docs retain a usable content column at phone, tablet, and desktop widths", async ({
  page,
}) => {
  for (const width of [375, 768, 1536, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/docs");
    await expect(
      page.getByRole("heading", { level: 1, name: "Introduction" }),
    ).toBeVisible();
    const article = page.locator("#nd-page");
    const body = article.locator(":scope > .docs-prose");
    const minimumWidth =
      width < 768
        ? width - 64
        : Math.min(600, width - 268 - 64 - (width >= 1280 ? 268 : 0));
    await expect
      .poll(async () => (await body.boundingBox())?.width ?? 0)
      .toBeGreaterThanOrEqual(minimumWidth);
    const bounds = await article.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    if (width >= 768) {
      const sidebar = page.locator("#nd-sidebar");
      await expect(
        sidebar.getByRole("button", { name: "Docs", exact: true }),
      ).toBeVisible();
      await expect(
        sidebar.getByRole("button", { name: "Components", exact: true }),
      ).toBeVisible();
    }
  }
});
