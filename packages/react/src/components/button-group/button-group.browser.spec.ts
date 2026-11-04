import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: ButtonGroup joins existing buttons in both orientations`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const horizontal = page.getByRole("group", {
      name: "Consumer button actions",
    });
    const first = horizontal.getByRole("button").first();
    const last = horizontal.getByRole("button").last();
    await expect(first).toHaveCSS("border-top-right-radius", "0px");
    await expect(last).toHaveCSS("border-top-left-radius", "0px");
    await expect(last).toHaveCSS("border-left-width", "0px");
    const a = await first.boundingBox();
    const b = await last.boundingBox();
    expect(Math.abs(a!.x + a!.width - b!.x)).toBeLessThan(1);
    await expect(
      page.getByRole("group", { name: "Consumer vertical actions" }),
    ).toHaveCSS("flex-direction", "column");
  });

  for (const orientation of ["horizontal", "vertical"] as const) {
    test(`${mode}: ${orientation} menu groups retain outer corners while open`, async ({
      page,
    }) => {
      await openConsumer(page, mode);
      const group = page.getByRole("group", {
        name: `Consumer ${orientation} menu actions`,
      });
      const first = group.getByRole("button", { name: "Save", exact: true });
      const trigger = group.getByRole("button", { name: "More", exact: true });
      const corners = await group.getByRole("button").evaluateAll((buttons) =>
        buttons.map((button) => {
          const css = getComputedStyle(button);
          return [
            css.borderTopLeftRadius,
            css.borderTopRightRadius,
            css.borderBottomRightRadius,
            css.borderBottomLeftRadius,
          ];
        }),
      );

      await trigger.click();
      await expect(page.getByRole("menu")).toBeVisible();
      expect(
        await group.locator("[data-base-ui-focus-guard]").count(),
      ).toBeGreaterThan(0);
      for (const [index, button] of [first, trigger].entries()) {
        for (const [corner, expected] of [
          ["border-top-left-radius", corners[index][0]],
          ["border-top-right-radius", corners[index][1]],
          ["border-bottom-right-radius", corners[index][2]],
          ["border-bottom-left-radius", corners[index][3]],
        ]) {
          await expect(button).toHaveCSS(corner, expected);
        }
      }
      await expect(trigger).toHaveCSS(
        orientation === "horizontal" ? "border-left-width" : "border-top-width",
        "0px",
      );
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    });
  }
}
