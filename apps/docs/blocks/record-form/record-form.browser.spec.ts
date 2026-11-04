import { expect, test } from "@playwright/test";

test("edit values reset to the original record", async ({ page }) => {
  await page.goto("/blocks/preview/record-form?variant=edit");
  const name = page.getByRole("textbox", { name: "Product name" });
  await expect(name).toHaveValue("Monstera deliciosa");
  await name.fill("Changed name");
  const price = page.getByRole("textbox", { name: "Price (USD)" });
  const stock = page.getByRole("textbox", { name: "Stock quantity" });
  const originalPrice = await price.inputValue();
  const originalStock = await stock.inputValue();
  await price.fill("18.50");
  await page.getByRole("button", { name: "Increase stock" }).click();
  await page.getByRole("button", { name: "Reset changes" }).click();
  await expect(name).toHaveValue("Monstera deliciosa");
  await expect(price).toHaveValue(originalPrice);
  await expect(stock).toHaveValue(originalStock);
  await expect(
    page.getByRole("region", { name: "Product details", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Pricing and inventory", exact: true }),
  ).toBeVisible();
});
