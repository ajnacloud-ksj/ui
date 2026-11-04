import { expect, type Locator, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

async function expectIndicator(
  list: Locator,
  tab: Locator,
  variant: "segmented" | "underline",
  vertical = false,
) {
  const indicator = list.locator('[data-slot="tabs-indicator"]');
  await expect(indicator).toBeVisible();
  await expect
    .poll(async () => {
      const active = await tab.boundingBox();
      const marker = await indicator.boundingBox();
      const bar = await list.boundingBox();
      if (!active || !marker || !bar) return Infinity;
      if (variant === "segmented")
        return Math.max(
          Math.abs(marker.x - active.x),
          Math.abs(marker.y - active.y),
          Math.abs(marker.width - active.width),
          Math.abs(marker.height - active.height),
        );
      if (vertical)
        return Math.max(
          Math.abs(marker.x - bar.x),
          Math.abs(marker.y - active.y),
          Math.abs(marker.height - active.height),
          Math.abs(marker.width - 2),
        );
      return Math.max(
        Math.abs(marker.x - active.x),
        Math.abs(marker.y - (active.y + active.height - 1)),
        Math.abs(marker.width - active.width),
        Math.abs(marker.height - 2),
      );
    })
    .toBeLessThan(1);
}

for (const mode of consumerModes) {
  test(`${mode}: Tabs keyboard activation, panel state, and moving indicator`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const list = page.getByRole("tablist", { name: "Consumer segmented tabs" });
    const overview = list.getByRole("tab", { name: "Overview" });
    const reports = list.getByRole("tab", { name: "Reports" });
    const settings = list.getByRole("tab", { name: "Settings" });
    await expectIndicator(list, overview, "segmented");
    await page
      .getByRole("textbox", { name: "Consumer tabs draft" })
      .fill("Draft to retain");
    await overview.focus();
    await page.keyboard.press("ArrowRight");
    await expect(reports).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(settings).toBeFocused();
    await expect(settings).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("tabpanel", { name: "Settings", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Consumer tabs draft" }),
    ).toBeHidden();
    await expectIndicator(list, settings, "segmented");
    expect(
      await settings.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    await overview.click();
    await expect(
      page.getByRole("textbox", { name: "Consumer tabs draft" }),
    ).toHaveValue("Draft to retain");
    const nested = page.getByRole("tablist", { name: "Consumer nested tabs" });
    await nested.getByRole("tab", { name: "Nested two" }).click();
    await expectIndicator(
      nested,
      nested.getByRole("tab", { name: "Nested two" }),
      "underline",
    );
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expectIndicator(list, overview, "segmented");
  });

  test(`${mode}: Tabs vertical and RTL indicator positions follow keyboard navigation`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const vertical = page.getByRole("tablist", {
      name: "Consumer vertical tabs",
    });
    await vertical.getByRole("tab", { name: "Account" }).focus();
    await page.keyboard.press("ArrowDown");
    const password = vertical.getByRole("tab", { name: "Password" });
    await expect(password).toBeFocused();
    await page.keyboard.press("Space");
    await expectIndicator(vertical, password, "underline", true);
    const rtl = page.getByRole("tablist", { name: "Consumer RTL tabs" });
    const one = rtl.getByRole("tab", { name: "One" });
    const two = rtl.getByRole("tab", { name: "Two" });
    expect((await one.boundingBox())!.x).toBeGreaterThan(
      (await two.boundingBox())!.x,
    );
    await one.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(two).toBeFocused();
    await expect(two).toHaveAttribute("aria-selected", "true");
    await expectIndicator(rtl, two, "underline");
  });

  test(`${mode}: Tabs overflow reveals keyboard focus and reduced motion stops transitions`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openConsumer(page, mode);
    const list = page.getByRole("tablist", {
      name: "Consumer overflowing tabs",
    });
    expect(
      await list.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ).toBe(true);
    await list.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("End");
    const security = list.getByRole("tab", { name: "Security" });
    await expect(security).toBeFocused();
    await page.keyboard.press("Enter");
    await expectIndicator(list, security, "segmented");
    await expect(list.locator('[data-slot="tabs-indicator"]')).toHaveCSS(
      "transition-property",
      "none",
    );
    const bar = (await list.boundingBox())!;
    const tab = (await security.boundingBox())!;
    expect(tab.x).toBeGreaterThanOrEqual(bar.x - 1);
    expect(tab.x + tab.width).toBeLessThanOrEqual(bar.x + bar.width + 1);
    const dimensions = await list.evaluate((element) => ({
      client: element.clientHeight,
      scroll: element.scrollHeight,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  });
}
