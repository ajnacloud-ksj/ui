import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Skeleton dimensions, decorative semantics, and reduced motion`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const skeleton = page.getByTestId("consumer-skeleton");
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    const shimmerStyle = () =>
      skeleton.evaluate((element) => {
        const style = getComputedStyle(element, "::after");
        return {
          animation: style.animationName,
          background: style.backgroundImage,
          display: style.display,
        };
      });
    await expect
      .poll(async () => (await shimmerStyle()).animation)
      .toBe("ajna-shimmer");
    await expect
      .poll(async () => (await shimmerStyle()).background)
      .toContain("linear-gradient");
    await expect(skeleton).toHaveCSS("overflow", "hidden");
    const lightGradient = (await shimmerStyle()).background;
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect
      .poll(async () => (await shimmerStyle()).background)
      .not.toBe(lightGradient);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(async () => (await shimmerStyle()).animation)
      .toBe("none");
    await expect.poll(async () => (await shimmerStyle()).display).toBe("none");
  });
}
