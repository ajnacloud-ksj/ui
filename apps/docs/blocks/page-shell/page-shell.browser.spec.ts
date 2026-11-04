import { expect, test } from "@playwright/test";

test("tabs and workspace export", async ({ page }) => {
  await page.goto("/blocks/preview/page-shell");
  await page.getByRole("tab", { name: "Team", exact: true }).click();
  await expect(page.getByText("Alex Rivera", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Billing", exact: true }).click();
  await expect(page.getByText("Standard plan", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export details" }).click();
  expect((await download).suggestedFilename()).toBe("workspace.json");
});
