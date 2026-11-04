import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: ToggleGroup selection, roving focus, and joined borders`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const group = page.getByRole("group", { name: "Consumer alignment" });
    const left = group.getByRole("button", { name: "Left" });
    const right = group.getByRole("button", { name: "Right" });
    await expect(group).toHaveCSS("gap", "0px");
    await expect(left).toHaveCSS("border-left-width", "1px");
    await expect(right).toHaveCSS("border-left-width", "0px");
    await expect(right).toHaveCSS("border-top-left-radius", "0px");
    await left.focus();
    await page.keyboard.press("ArrowRight");
    await expect(right).toBeFocused();
    await expect(right).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Space");
    await expect(right).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Space");
    await expect(right).toHaveAttribute("aria-pressed", "false");
    const formatting = page.getByRole("group", { name: "Consumer formatting" });
    await formatting.getByRole("button", { name: "Italic" }).click();
    await expect(
      formatting.getByRole("button", { name: "Bold" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      formatting.getByRole("button", { name: "Italic" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test(`${mode}: ToggleGroup vertical and RTL layouts match keyboard direction`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const vertical = page.getByRole("group", {
      name: "Consumer vertical toggles",
    });
    await expect(vertical).toHaveCSS("flex-direction", "column");
    await vertical.getByRole("button", { name: "Top" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(
      vertical.getByRole("button", { name: "Bottom" }),
    ).toBeFocused();
    const rtl = page.getByRole("group", { name: "Consumer RTL toggles" });
    const one = rtl.getByRole("button", { name: "One" });
    const two = rtl.getByRole("button", { name: "Two" });
    expect((await one.boundingBox())!.x).toBeGreaterThan(
      (await two.boundingBox())!.x,
    );
    await expect(two).toHaveCSS("border-right-width", "0px");
    await one.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(two).toBeFocused();
  });
}
