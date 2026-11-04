import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: description pairs wrap and stack without losing semantics`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const section = page.getByRole("region", {
      name: "Description list example",
    });
    const group = section.locator("[data-slot=description-group]").first();
    const term = group.locator("dt");
    const detail = group.locator("dd");
    await expect(detail).toHaveText("0");
    await page.setViewportSize({ width: 960, height: 900 });
    expect((await detail.boundingBox())!.x).toBeGreaterThan(
      (await term.boundingBox())!.x,
    );
    await expect(section.getByTestId("nested-description-group")).toHaveCSS(
      "grid-template-columns",
      /^(?!.*px .*px).*$/,
    );
    await page.setViewportSize({ width: 320, height: 900 });
    expect((await detail.boundingBox())!.y).toBeGreaterThan(
      (await term.boundingBox())!.y,
    );
    expect(
      await section.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    const link = section.getByRole("link", { name: "View owner" });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#description-owner$/);
  });
}
