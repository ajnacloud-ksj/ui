import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";
for (const mode of consumerModes) {
  test(`${mode}: Slider pointer, keyboard, range, and orientation`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const thumb = page.getByRole("slider", { name: "Consumer volume" });
    await page.getByText("Consumer volume", { exact: true }).click();
    await expect(thumb).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(thumb).toHaveValue("45");
    const slider = page.getByTestId("consumer-slider");
    const track = slider.locator('[data-slot="slider-control"]');
    const box = (await track.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    await expect(thumb).not.toHaveValue("45");
    const knob = slider.locator('[data-slot="slider-thumb"]');
    const knobBox = (await knob.boundingBox())!;
    await page.mouse.move(
      knobBox.x + knobBox.width / 2,
      knobBox.y + knobBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, {
      steps: 5,
    });
    await page.mouse.up();
    await expect
      .poll(async () => Number(await thumb.inputValue()))
      .toBeLessThan(50);
    const min = page.getByRole("slider", { name: "Consumer minimum" });
    await min.focus();
    await page.keyboard.press("ArrowRight");
    await expect(min).toHaveValue("21");
    await expect(
      page.getByRole("slider", { name: "Consumer maximum" }),
    ).toHaveValue("80");
    const vertical = page.getByRole("slider", { name: "Consumer vertical" });
    await vertical.focus();
    await page.keyboard.press("ArrowUp");
    await expect(vertical).toHaveValue("51");
    const rtl = page.getByRole("slider", { name: "Consumer RTL slider" });
    await rtl.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(rtl).toHaveValue("51");
    await expect(
      page.getByRole("slider", { name: "Consumer disabled slider" }),
    ).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(knob).toHaveCSS("transition-property", "none");
  });
}
