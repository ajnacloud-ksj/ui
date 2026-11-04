import { expect, test } from "@playwright/test";

test("Source displays code, switches files, and preserves the selected file", async ({
  page,
}) => {
  await page.goto("/blocks/app-shell");
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  const source = page.getByRole("tabpanel", { name: "Source", exact: true });
  const picker = source.getByRole("combobox", { name: "Source file" });
  await expect(picker).toContainText("blocks/app-shell/app-shell.tsx");
  await expect(
    page
      .getByRole("region", {
        name: "blocks/app-shell/app-shell.tsx source code",
        exact: true,
      })
      .locator("pre"),
  ).toContainText("export function AppShell");
  await expect(
    page.getByRole("button", { name: "Desktop preview" }),
  ).toBeHidden();
  await picker.click();
  await page
    .getByRole("option", {
      name: "blocks/collection-page/collection-page.tsx",
      exact: true,
    })
    .click();
  const code = page.getByRole("region", {
    name: "blocks/collection-page/collection-page.tsx source code",
    exact: true,
  });
  await expect(code.locator("pre")).toContainText(
    "export function CollectionPage",
  );
  await expect(
    source.getByRole("button", { name: "Copy Text", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await expect(picker).toContainText(
    "blocks/collection-page/collection-page.tsx",
  );
  await expect(code).toBeVisible();
});
