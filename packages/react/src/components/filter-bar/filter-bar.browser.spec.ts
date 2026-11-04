import { expect, test } from "@playwright/test";

import { consumerModes, openConsumer } from "../../../test-utils/consumer";

for (const mode of consumerModes) {
  test(`${mode}: search and filters share the desktop row and wrap on mobile`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", {
      name: "Consumer filter bar",
      exact: true,
    });
    const search = region.getByRole("searchbox", {
      name: "Consumer filter search",
    });
    const trigger = region.getByRole("button", {
      name: "Consumer filters",
      exact: true,
    });
    await expect
      .poll(async () => {
        const a = await search.boundingBox();
        const b = await trigger.boundingBox();
        return a && b
          ? Math.abs(a.y + a.height / 2 - b.y - b.height / 2)
          : Infinity;
      })
      .toBeLessThan(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(async () => {
        const a = await search.boundingBox();
        const b = await trigger.boundingBox();
        return a && b ? b.y - a.y - a.height : -1;
      })
      .toBeGreaterThanOrEqual(0);
  });

  test(`${mode}: staged filtering, nested options, external updates, and chip focus`, async ({
    page,
  }) => {
    await openConsumer(page, mode);
    const region = page.getByRole("region", {
      name: "Consumer filter bar",
      exact: true,
    });
    const trigger = region.getByRole("button", {
      name: "Consumer filters",
      exact: true,
    });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Filters", exact: true });
    await expect(panel).toHaveAttribute("data-swipe-direction", "right");
    expect((await panel.boundingBox())?.width).toBe(384);
    const toggle = panel.getByRole("checkbox", {
      name: "Filter archived",
      exact: true,
    });
    const toggleLabel = panel.getByText("Filter archived", { exact: true });
    await expect
      .poll(async () => {
        const box = await toggle.boundingBox();
        const labelBox = await toggleLabel.boundingBox();
        return box && labelBox
          ? Math.abs(box.y + box.height / 2 - labelBox.y - labelBox.height / 2)
          : Infinity;
      })
      .toBeLessThan(1);
    await toggleLabel.click();
    await expect(toggle).toBeChecked();
    await panel
      .getByRole("button", { name: "Reset Filter archived", exact: true })
      .click();
    await expect(toggle).not.toBeChecked();
    await expect(toggle).toBeFocused();

    await panel
      .getByRole("textbox", { name: "Filter reference", exact: true })
      .fill("INV-42");
    await panel
      .getByRole("button", { name: "External filter update", exact: true })
      .click();
    await panel
      .getByRole("combobox", { name: "Filter owners", exact: true })
      .click();
    await page.getByRole("option", { name: /^Alex/ }).click();
    await page.keyboard.press("Escape");
    await expect(panel).toBeVisible();
    await panel
      .getByRole("textbox", { name: "Filter price Minimum", exact: true })
      .fill("0");
    await panel.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(
      region.getByRole("status", { name: "Filter updates" }),
    ).toHaveText("1");
    const values = JSON.parse(
      await region.getByRole("status", { name: "Filter value" }).innerText(),
    ) as {
      status: string;
      reference: string;
      owners: number[];
      price: { min: number };
    };
    expect(values).toMatchObject({
      status: "paused",
      reference: "INV-42",
      owners: [0],
      price: { min: 0 },
    });
    await region
      .getByRole("button", {
        name: "Remove Filter reference filter",
        exact: true,
      })
      .click();
    await expect(
      region.getByRole("button", {
        name: "Remove Filter price filter",
        exact: true,
      }),
    ).toBeFocused();
    await region
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await expect(trigger).toBeFocused();
    await expect(
      region.getByRole("group", { name: "Active filters" }),
    ).toHaveCount(0);
    await expect(
      region.getByRole("status", { name: "Filter form submissions" }),
    ).toHaveText("0");
  });

  test(`${mode}: mobile panel, validation, date popup, and discarded drafts`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConsumer(page, mode);
    const region = page.getByRole("region", {
      name: "Consumer filter bar",
      exact: true,
    });
    const trigger = region.getByRole("button", {
      name: "Consumer filters",
      exact: true,
    });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Filters", exact: true });
    await expect(panel).toHaveAttribute("data-swipe-direction", "down");
    const viewport = panel.getByRole("region", {
      name: "Filter options",
      exact: true,
    });
    await expect
      .poll(() =>
        viewport.evaluate((node) => node.scrollHeight - node.clientHeight),
      )
      .toBeGreaterThan(0);
    await viewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect
      .poll(() => viewport.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0);
    await expect(
      panel.getByRole("button", { name: "Apply", exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("dialog", { name: "Filters", exact: true }),
    ).toHaveCount(1);
    await panel
      .getByRole("textbox", { name: "Filter price Maximum", exact: true })
      .fill("10");
    await panel
      .getByRole("textbox", { name: "Filter price Minimum", exact: true })
      .fill("20");
    await expect(
      panel.getByText("The start must not be greater than the end."),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Apply", exact: true }),
    ).toBeDisabled();
    await panel
      .getByRole("textbox", { name: "Filter price Minimum", exact: true })
      .fill("0");
    await expect(
      panel.getByRole("button", { name: "Apply", exact: true }),
    ).toBeEnabled();
    await panel
      .getByRole("button", { name: "Filter delivery", exact: true })
      .click();
    await expect(page.getByRole("grid")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(panel).toBeHidden();
    await expect(
      region.getByRole("status", { name: "Filter updates" }),
    ).toHaveText("0");
    await trigger.click();
    await expect(
      panel.getByRole("textbox", { name: "Filter price Minimum", exact: true }),
    ).toHaveValue("");
    await panel.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await trigger.click();
    await expect(panel).toHaveCSS("transition-property", "none");
  });
  test(`${mode}: mobile header alignment and visible range labels`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openConsumer(page, mode);
    await page
      .getByRole("button", { name: "Compact filters", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Filters", exact: true });
    await expect(panel).toBeVisible();

    const title = panel.getByRole("heading", { name: "Filters", exact: true });
    const description = panel.getByText(
      "Results update as you change filters.",
      { exact: true },
    );
    const minimum = panel.getByRole("textbox", {
      name: "Compact quantity Minimum",
      exact: true,
    });
    const maximum = panel.getByRole("textbox", {
      name: "Compact quantity Maximum",
      exact: true,
    });
    await expect(minimum).toHaveAttribute("placeholder", "Minimum");
    await expect(maximum).toHaveAttribute("placeholder", "Maximum");
    await expect(panel.getByText("Minimum", { exact: true })).toBeVisible();
    await expect(panel.getByText("Maximum", { exact: true })).toBeVisible();
    await expect(description).toHaveCSS("text-align", "start");
    const direction = await description.evaluate(
      (node) => getComputedStyle(node).direction,
    );
    await expect
      .poll(async () => {
        const titleBox = await title.boundingBox();
        const descriptionBox = await description.boundingBox();
        if (!titleBox || !descriptionBox) return Infinity;
        return direction === "rtl"
          ? Math.abs(
              titleBox.x +
                titleBox.width -
                descriptionBox.x -
                descriptionBox.width,
            )
          : Math.abs(titleBox.x - descriptionBox.x);
      })
      .toBeLessThan(1);
    await panel.getByText("Minimum", { exact: true }).click();
    await expect(minimum).toBeFocused();
    const quantity = panel.getByRole("group", {
      name: "Compact quantity",
      exact: true,
    });
    await minimum.fill("0");
    const reset = quantity.getByRole("button", {
      name: "Reset Compact quantity",
      exact: true,
    });
    await reset.click();
    await expect(minimum).toBeFocused();
    await expect(minimum).toHaveValue("");
    await panel.getByRole("button", { name: "Done", exact: true }).click();
    await expect(panel).toBeHidden();
  });
}
