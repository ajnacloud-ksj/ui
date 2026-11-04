import { render, screen } from "@testing-library/react";
import postcss, { type Root } from "postcss";
import tailwindcss from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

import { ButtonGroup, buttonGroupVariants } from "./button-group";

let css: Root;

beforeAll(async () => {
  const result = await postcss([
    tailwindcss({
      content: [
        {
          raw: (["horizontal", "vertical"] as const)
            .map((orientation) =>
              buttonGroupVariants({
                orientation,
              }),
            )
            .join(" "),
        },
      ],
      corePlugins: { preflight: false },
    }),
  ]).process("@tailwind utilities;", { from: undefined });
  css = result.root;
});

function styledBy(element: Element, property: string) {
  let matches = false;
  css.walkRules((rule) => {
    if (
      rule.nodes.some((node) => node.type === "decl" && node.prop === property)
    ) {
      const childSelector = rule.selector.slice(
        rule.selector.lastIndexOf(">*") + 1,
      );
      matches ||= element.matches(childSelector);
    }
  });
  return matches;
}

describe.each(["horizontal", "vertical"] as const)(
  "%s ButtonGroup styles",
  (orientation) => {
    it.each([false, true])(
      "joins controls with popup helpers present: %s",
      (open) => {
        render(
          <ButtonGroup orientation={orientation}>
            {open && <span data-base-ui-focus-guard="" />}
            <button>First</button>
            {open && <span data-base-ui-focus-guard="" />}
            <input aria-label="Middle" />
            {open && <span aria-owns="popup" />}
            <button>Last</button>
            {open && <span data-base-ui-focus-guard="" />}
          </ButtonGroup>,
        );
        const first = screen.getByRole("button", { name: "First" });
        const middle = screen.getByRole("textbox", { name: "Middle" });
        const last = screen.getByRole("button", { name: "Last" });
        const start =
          orientation === "horizontal"
            ? "border-start-start-radius"
            : "border-top-left-radius";
        const end =
          orientation === "horizontal"
            ? "border-end-end-radius"
            : "border-bottom-right-radius";
        const border =
          orientation === "horizontal"
            ? "border-inline-start-width"
            : "border-top-width";

        expect(styledBy(first, start)).toBe(false);
        expect(styledBy(first, end)).toBe(true);
        expect(styledBy(first, border)).toBe(false);
        expect(styledBy(middle, start)).toBe(true);
        expect(styledBy(middle, end)).toBe(true);
        expect(styledBy(middle, border)).toBe(true);
        expect(styledBy(last, start)).toBe(true);
        expect(styledBy(last, end)).toBe(false);
        expect(styledBy(last, border)).toBe(true);
      },
    );
  },
);
