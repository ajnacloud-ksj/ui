import { expect, test } from "@playwright/test";

test("aligns header borders and keeps the compact account button inside the sidebar", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop icon rail layout");
  await page.goto("/blocks/preview/app-shell");
  const sidebar = page.locator('aside[data-sidebar="sidebar"]');
  const sidebarHeader = sidebar.locator('[data-sidebar="header"]');
  const header = page.locator("header");
  await expect
    .poll(async () => {
      const a = await sidebarHeader.boundingBox();
      const b = await header.boundingBox();
      return a && b ? Math.abs(a.y + a.height - b.y - b.height) : Infinity;
    })
    .toBeLessThan(1);
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(sidebar).toHaveCSS("width", "57px");
  const account = sidebar.getByRole("button", { name: "Account menu" });
  await expect
    .poll(async () => {
      const bounds = await sidebar.boundingBox();
      const button = await account.boundingBox();
      const avatar = await account
        .locator('[data-ajna-component="avatar"]')
        .boundingBox();
      if (!bounds || !button || !avatar) return Infinity;
      return Math.max(
        Math.abs(avatar.x + avatar.width / 2 - bounds.x - bounds.width / 2),
        Math.max(0, avatar.x + avatar.width - button.x - button.width),
        Math.max(0, button.x + button.width - bounds.x - bounds.width),
      );
    })
    .toBeLessThan(1);
  await account.click();
  await expect(
    page.getByRole("menuitem", { name: "Profile settings" }),
  ).toBeVisible();
});

test("navigation, command search, and mobile dismissal", async ({
  page,
}, testInfo) => {
  await page.goto("/blocks/preview/app-shell");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }
  await page.getByRole("link", { name: "Activity", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Activity", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Search workspace" }).click();
  const palette = page.getByRole("dialog", { name: "Search workspace" });
  await palette.getByRole("combobox").fill("settings");
  await palette.getByRole("option", { name: "Settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
});
