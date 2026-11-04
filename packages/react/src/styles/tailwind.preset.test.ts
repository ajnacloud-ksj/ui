// @vitest-environment node
import { createRequire } from "node:module";

import postcss from "postcss";
import tailwindcss, { type Config } from "tailwindcss";
import { describe, expect, it } from "vitest";

import theme from "./theme.json";

const require = createRequire(import.meta.url);
const preset = require("./tailwind.preset.cjs") as Partial<Config>;

async function compile(config: Partial<Config> = {}, overrides = "") {
  return postcss([
    tailwindcss({
      presets: [preset],
      content: [
        {
          raw: "bg-ajna-primary bg-ajna-card rounded-ajna-base font-ajna h-12",
          extension: "html",
        },
      ],
      corePlugins: { preflight: false },
      ...config,
    }),
  ]).process(`@tailwind base; @tailwind utilities; ${overrides}`, {
    from: undefined,
  });
}

describe("Tailwind preset", () => {
  it("emits complete theme defaults with Preflight disabled and no scanned dark class", async () => {
    const result = await compile();
    const rules = new Map<string, Record<string, string>>();
    result.root.walkRules((rule) => {
      const values: Record<string, string> = {};
      rule.walkDecls((decl) => {
        values[decl.prop] = decl.value;
      });
      rules.set(rule.selector, values);
    });
    for (const [name, values] of Object.entries(theme.colors)) {
      expect(rules.get(":root")?.[`--ajna-${name}`]).toBe(values[0]);
      expect(rules.get(':root[class~="dark"]')?.[`--ajna-${name}`]).toBe(
        values[1],
      );
    }
    expect(rules.get(":root")?.["--ajna-radius"]).toBe(theme.radius);
    expect(rules.get(".bg-ajna-primary")?.["background-color"]).toContain(
      "hsl(var(--ajna-primary)",
    );
    expect(rules.get(".rounded-ajna-base")?.["border-radius"]).toBe(
      "var(--ajna-radius)",
    );
    expect(rules.get(".font-ajna")?.["font-family"]).toBe(
      "var(--ajna-font-sans, inherit)",
    );
    expect(rules.get(".h-12")?.height).toBe("3rem");
    expect(rules.has("body")).toBe(false);
    expect(result.css).not.toContain("--ajna-primary-hover");
  });

  it("places application overrides and aliases after defaults without changing their values", async () => {
    const result = await compile(
      {},
      `
      :root { --primary: 173 80% 24%; }
      :root.dark { --primary: 173 80% 72%; }
      :root, :root.dark {
        --ajna-primary: var(--primary);
        --card: var(--ajna-card);
        --ajna-radius: 1rem;
      }
    `,
    );
    const declarations: string[] = [];
    result.root.walkDecls("--ajna-primary", (decl) => {
      declarations.push(decl.value);
    });
    expect(declarations).toEqual([...theme.colors.primary, "var(--primary)"]);
    expect(result.css).toContain("--card: var(--ajna-card)");
  });

  it("generates brand utilities and opacity modifiers from the shared palette", async () => {
    const result = await compile({
      content: [
        {
          raw: "bg-ajna-brand-navy text-ajna-brand-orange fill-ajna-brand-blue stroke-ajna-brand-light-blue border-ajna-brand-gray bg-ajna-brand-orange/25",
          extension: "html",
        },
      ],
    });
    const rules = new Map<string, Record<string, string>>();
    result.root.walkRules((rule) => {
      const values: Record<string, string> = {};
      rule.walkDecls((decl) => {
        values[decl.prop] = decl.value;
      });
      rules.set(rule.selector, values);
    });
    const utilities = [
      [".bg-ajna-brand-navy", "background-color", "navy"],
      [".text-ajna-brand-orange", "color", "orange"],
      [".fill-ajna-brand-blue", "fill", "blue"],
      [".stroke-ajna-brand-light-blue", "stroke", "light-blue"],
      [".border-ajna-brand-gray", "border-color", "gray"],
    ];
    for (const [selector, property, color] of utilities) {
      expect(rules.get(selector)?.[property]).toContain(
        `var(--ajna-brand-${color})`,
      );
    }
    expect(rules.get(".bg-ajna-brand-orange\\/25")?.["background-color"]).toBe(
      "hsl(var(--ajna-brand-orange) / 0.25)",
    );
    for (const [name, values] of Object.entries(theme.colors).filter(([name]) =>
      name.startsWith("brand-"),
    )) {
      expect(rules.get(":root")?.[`--ajna-${name}`]).toBe(values[0]);
      expect(rules.get(':root[class~="dark"]')?.[`--ajna-${name}`]).toBe(
        values[0],
      );
    }
  });

  it("preserves consumer prefix settings and still emits unprefixed token names", async () => {
    const result = await compile({
      prefix: "app-",
      content: [{ raw: "app-bg-ajna-primary", extension: "html" }],
    });
    expect(result.css).toContain(".app-bg-ajna-primary");
    expect(result.css).toContain("--ajna-primary:");
    expect(result.css).not.toContain("--app-ajna-primary");
  });
});
