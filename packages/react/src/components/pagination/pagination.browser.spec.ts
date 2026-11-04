import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: Pagination commits drafts once and changes size atomically`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", {
      name: "Consumer pagination",
      exact: true,
    });
    const input = region.getByRole("textbox", { name: "Page number" });
    await input.fill("999");
    await input.press("Enter");
    await expect(
      region.getByRole("status", { name: "Pagination state" }),
    ).toHaveText("12:20");
    await expect(
      region.getByRole("status", { name: "Pagination changes" }),
    ).toHaveText("1");
    await input.press("Tab");
    await expect(
      region.getByRole("status", { name: "Pagination changes" }),
    ).toHaveText("1");
    await expect(
      region.getByRole("status", { name: "Pagination form submissions" }),
    ).toHaveText("0");
    await expect(
      region.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    const select = region.getByRole("combobox", { name: "Items per page" });
    await select.press("ArrowDown");
    await page.getByRole("option", { name: "50", exact: true }).click();
    await expect(
      region.getByRole("status", { name: "Pagination state" }),
    ).toHaveText("1:50");
    await expect(
      region.getByRole("status", { name: "Pagination changes" }),
    ).toHaveText("2");
    await expect(region.getByText("1–50", { exact: true })).toBeVisible();
    await expect(
      region.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    await input.fill("2.5");
    await input.press("Enter");
    await expect(input).toHaveValue("1");
    await expect(
      region.getByRole("status", { name: "Pagination changes" }),
    ).toHaveText("2");
  });

  test(`${mode}: Unknown-total pagination uses returned counts and stops at the last response`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", { name: "Unknown pagination" });
    await expect(
      region.getByRole("button", { name: "First page" }),
    ).toHaveCount(0);
    await expect(region.getByRole("button", { name: "Last page" })).toHaveCount(
      0,
    );
    await region.getByRole("button", { name: "Next page" }).click();
    await region.getByRole("button", { name: "Next page" }).click();
    await expect(region.getByText("41–47", { exact: true })).toBeVisible();
    await expect(region.getByText("Page 3", { exact: true })).toBeVisible();
    await expect(
      region.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    await region.getByRole("button", { name: "Previous page" }).click();
    await expect(region.getByText("21–40", { exact: true })).toBeVisible();
  });
}
