import { expect, test } from "@playwright/test";

test("keeps exactly one view selected and switches the same records", async ({
  page,
}) => {
  await page.goto("/blocks/preview/view-switcher");
  const table = page.getByRole("button", { name: "Table view" });
  const grid = page.getByRole("button", { name: "Grid view" });
  await expect(table).toHaveAttribute("aria-pressed", "true");
  await grid.click();
  await expect(grid).toHaveAttribute("aria-pressed", "true");
  await expect(table).toHaveAttribute("aria-pressed", "false");
  await grid.click();
  await expect(grid).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);
  await table.focus();
  await page.keyboard.press("Enter");
  await expect(table).toHaveAttribute("aria-pressed", "true");
});
