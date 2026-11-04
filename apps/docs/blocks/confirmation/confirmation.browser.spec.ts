import { expect, test } from "@playwright/test";

test("requires exact text and keeps action failures open", async ({ page }) => {
  await page.goto("/blocks/preview/confirmation");
  await page
    .getByRole("checkbox", { name: "Preview an action failure" })
    .check();
  await page
    .getByRole("button", { name: "Delete workspace", exact: true })
    .click();
  const dialog = page.getByRole("alertdialog");
  const confirm = dialog.getByRole("button", { name: "Delete workspace" });
  await expect(confirm).toBeDisabled();
  await dialog.getByRole("textbox").fill("greenhouse");
  await expect(confirm).toBeDisabled();
  await dialog.getByRole("textbox").fill("Greenhouse");
  await confirm.click();
  await expect(dialog.getByRole("alert")).toContainText("could not be deleted");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await page
    .getByRole("button", { name: "Delete workspace", exact: true })
    .click();
  await expect(page.getByRole("alertdialog").getByRole("textbox")).toHaveValue(
    "",
  );
});
