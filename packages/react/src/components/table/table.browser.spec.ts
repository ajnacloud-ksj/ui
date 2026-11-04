import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer.js";

for (const mode of consumerModes) {
  test(`${mode}: Only body rows highlight on hover and pinned cells follow their row`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const table = page.getByRole("table", { name: "Consumer projects" });
    const header = table.locator("thead tr");
    const head = header.getByRole("columnheader").first();
    const headerColor = await header.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    const headColor = await head.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    const rows = table.locator("tbody tr");
    const selected = rows.nth(1);
    const selectedColor = await selected.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    for (const index of [0, 3]) {
      const row = rows.nth(index);
      const original = await row.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      );
      await row.hover();
      await expect(row).toHaveCSS("background-color", selectedColor);
      await expect(row).not.toHaveCSS("background-color", original);
      await expect(row.getByRole("cell").first()).toHaveCSS(
        "background-color",
        selectedColor,
      );
      await expect(row.getByRole("cell").last()).toHaveCSS(
        "background-color",
        selectedColor,
      );
      await head.hover();
      await expect(row).toHaveCSS("background-color", original);
      await expect(header).toHaveCSS("background-color", headerColor);
      await expect(head).toHaveCSS("background-color", headColor);
    }
    await selected.hover();
    await expect(selected).toHaveCSS("background-color", selectedColor);
  });

  test(`${mode}: Table selection and keyboard sorting`, async ({ page }) => {
    await openConsumer(page, mode);
    const table = page.getByRole("table", { name: "Consumer projects" });
    const body = table.locator("tbody");
    const head = table.locator("thead th").first();
    const all = table.getByRole("checkbox", {
      name: "Select all consumer projects",
    });
    await expect(all).toHaveAttribute("aria-checked", "mixed");
    await all.click();
    await expect(all).toHaveAttribute("aria-checked", "true");
    await expect(body.getByRole("row").first()).toHaveAttribute(
      "data-variant",
      "selected",
    );
    const row = body.getByRole("row").first();
    await expect(row.getByRole("cell").first()).toHaveCSS(
      "background-color",
      await row.evaluate((node) => getComputedStyle(node).backgroundColor),
    );
    const sort = table.getByRole("button", {
      name: "Consumer project",
      exact: true,
    });
    await sort.focus();
    await page.keyboard.press("Enter");
    await expect(head).toHaveAttribute("aria-sort", "ascending");
    await expect(
      body.getByRole("row").first().getByRole("cell").first(),
    ).toHaveText("API");
    await page.keyboard.press("Space");
    await expect(head).toHaveAttribute("aria-sort", "descending");
    await page.keyboard.press("Space");
    await expect(head).toHaveAttribute("aria-sort", "none");
    await expect(
      body.getByRole("row").first().getByRole("cell").first(),
    ).toHaveText("Website");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sort).toHaveCSS("transition-property", "none");
  });

  test(`${mode}: Table pins header and edge columns during scrolling`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const viewport = page.getByTestId("consumer-table-scroll");
    const table = page.getByTestId("consumer-table");
    const left = table.locator("tbody tr").nth(4).locator("td").first();
    const right = table.locator("tbody tr").nth(4).locator("td").last();
    await viewport.evaluate((node) => {
      node.scrollLeft = 200;
      node.scrollTop = 120;
    });
    const frame = (await viewport.boundingBox())!;
    await expect
      .poll(async () => Math.abs((await left.boundingBox())!.x - frame.x - 1))
      .toBeLessThan(2);
    await expect
      .poll(async () =>
        Math.abs(
          (await right.boundingBox())!.x +
            (await right.boundingBox())!.width -
            frame.x -
            frame.width +
            1,
        ),
      )
      .toBeLessThan(2);
    const head = table.locator("thead th").first();
    await expect
      .poll(async () => Math.abs((await head.boundingBox())!.y - frame.y - 1))
      .toBeLessThan(2);
    expect(
      await left.evaluate(
        (node) => getComputedStyle(node, "::before").backgroundImage,
      ),
    ).not.toBe("none");
    expect(
      await right.evaluate(
        (node) => getComputedStyle(node, "::before").backgroundImage,
      ),
    ).not.toBe("none");
  });

  test(`${mode}: Table resize handle supports focus and application drag handlers`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const handle = page.getByRole("button", {
      name: "Resize consumer project",
    });
    await handle.focus();
    await expect(handle).toHaveCSS("opacity", "1");
    await expect(handle).not.toHaveCSS("box-shadow", "none");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("consumer-table-width")).toHaveText("210");
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, {
      steps: 5,
    });
    await page.mouse.up();
    await expect
      .poll(async () =>
        Number(await page.getByTestId("consumer-table-width").textContent()),
      )
      .toBeGreaterThan(210);
    await expect(
      page.getByTestId("consumer-table").locator("thead th").first(),
    ).toHaveAttribute("aria-sort", "none");
  });
}
