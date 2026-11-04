import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: native scroll, overflow fades, and tracks`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const viewport = page.getByRole("region", {
      name: "Consumer scroll region",
    });
    await viewport.scrollIntoViewIfNeeded();
    await expect(viewport).toHaveAttribute("tabindex", "0");
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          node.style.getPropertyValue("--scroll-area-overflow-y-start"),
        ),
      )
      .toBe("0px");
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          parseFloat(
            node.style.getPropertyValue("--scroll-area-overflow-y-end"),
          ),
        ),
      )
      .toBeGreaterThan(400);
    expect(
      await viewport.evaluate((node) => getComputedStyle(node).maskImage),
    ).toContain("linear-gradient");
    await viewport.evaluate((node) => {
      node.scrollTop = 100;
      node.scrollLeft = 100;
    });
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          parseFloat(
            node.style.getPropertyValue("--scroll-area-overflow-y-start"),
          ),
        ),
      )
      .toBeGreaterThan(90);
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          parseFloat(
            node.style.getPropertyValue("--scroll-area-overflow-x-start"),
          ),
        ),
      )
      .toBeGreaterThan(90);
    const root = page
      .locator('[data-slot="scroll-area"]')
      .filter({ has: viewport });
    await root.hover();
    await expect(
      root.locator('[data-slot="scroll-area-scrollbar"]'),
    ).toHaveCount(2);
    await viewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      node.scrollLeft = node.scrollWidth;
    });
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          node.style.getPropertyValue("--scroll-area-overflow-y-end"),
        ),
      )
      .toBe("0px");
    await expect
      .poll(() =>
        viewport.evaluate((node) =>
          node.style.getPropertyValue("--scroll-area-overflow-x-end"),
        ),
      )
      .toBe("0px");
    await viewport.focus();
    await page.keyboard.press("Home");
    await expect
      .poll(() => viewport.evaluate((node) => node.scrollTop))
      .toBe(0);
  });
}
