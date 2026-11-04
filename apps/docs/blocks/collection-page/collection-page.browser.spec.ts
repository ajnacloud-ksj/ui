import { expect, test } from "@playwright/test";

test("grid and table share records, and create/edit updates the collection", async ({
  page,
}) => {
  await page.goto("/blocks/preview/collection-page");
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page.locator("article")).toHaveCount(6);
  await page.getByRole("button", { name: "Table view" }).click();
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("Monstera");
  await expect(
    page.getByRole("button", { name: "Monstera deliciosa", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ficus elastica", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Add product", exact: true }).click();
  await page.getByRole("textbox", { name: "Product name" }).fill("Silver fern");
  await page.getByRole("textbox", { name: "SKU" }).fill("TEST-001");
  await page.getByRole("textbox", { name: "Price (USD)" }).fill("18.50");
  await page.getByRole("textbox", { name: "Stock quantity" }).fill("4");
  await page.getByRole("button", { name: "Create product" }).click();
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("Silver fern");
  await expect(
    page.getByRole("cell", { name: "$18.50", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Silver fern" }).click();
  await page
    .getByRole("textbox", { name: "Product name" })
    .fill("Updated fern");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("Updated fern");
  await expect(
    page.getByRole("button", { name: "Updated fern", exact: true }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Select Updated fern" }).check();
  await page
    .getByRole("button", { name: "Archive products", exact: true })
    .click();
  const confirmation = page.getByRole("alertdialog");
  await confirmation.getByRole("button", { name: "Archive products" }).click();
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByText("No matching products")).toBeVisible();
});

test("empty and failed requests offer working recovery actions", async ({
  page,
}) => {
  await page.goto("/blocks/preview/collection-page?state=empty");
  await expect(page.getByText("Your catalog starts here")).toBeVisible();
  await page.goto("/blocks/preview/collection-page?state=error");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("table", { name: "Products" })).toBeVisible();
});
