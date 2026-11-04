import { expect, type Locator, type Page } from "@playwright/test";

export const consumerModes = ["standalone", "tailwind", "tailwind-v4"] as const;
export type ConsumerMode = (typeof consumerModes)[number];

export async function openConsumer(page: Page, mode: ConsumerMode) {
  await page.goto(mode === "standalone" ? "/" : `/${mode}.html`);
}

export async function expectCentered(dialog: Locator, page: Page) {
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => {
      const box = await dialog.boundingBox();
      if (!box) return Infinity;
      return Math.max(
        Math.abs(box.x + box.width / 2 - viewport.width / 2),
        Math.abs(box.y + box.height / 2 - viewport.height / 2),
      );
    })
    .toBeLessThan(1);
}
