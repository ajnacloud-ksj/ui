import { expect, test } from "@playwright/test";

test("validates required fields and submits sign-in", async ({ page }) => {
  await page.goto("/blocks/preview/login-page");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Username or email" })
    .fill("alex@example.com");
  await page.locator('input[name="password"]').fill("example-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator('input[name="password"]')).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Signed in" })).toBeVisible();
});
