import { fileURLToPath } from "node:url";

import autoprefixer from "autoprefixer";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

export const scopeUtilities = {
  postcssPlugin: "ajna-scope-utilities",
  OnceExit(root, { result }) {
    const theme = result?.opts?.theme ?? {};
    const sidebarColors = theme.sidebarColors || {};
    root.walkRules((rule) => {
      if (
        rule.parent &&
        rule.parent.type === "atrule" &&
        rule.parent.name &&
        rule.parent.name.endsWith("keyframes")
      )
        return;
      const declarations = rule.nodes.filter((node) => node.type === "decl");
      if (
        [":root", ':root[class~="dark"]'].includes(rule.selector) &&
        declarations.every(
          (node) =>
            node.prop.startsWith("--ajna-") ||
            Object.hasOwn(sidebarColors, node.prop.slice(2)),
        )
      )
        return;
      if (
        declarations.length &&
        declarations.every((node) => node.prop.startsWith("--tw-")) &&
        rule.selectors.every((selector) =>
          ["*", "::before", "::after", "::backdrop"].includes(selector),
        )
      ) {
        if (rule.selector === "::backdrop") {
          rule.remove();
          return;
        }
        rule.selector =
          "[data-ajna-component], [data-ajna-component]::before, [data-ajna-component]::after";
      } else {
        // :where keeps specificity equal to the consumer's own utility classes.
        rule.selectors = rule.selectors.map(
          (selector) => `:where([data-ajna-component])${selector}`,
        );
        if (declarations.some((node) => node.prop === "transform")) {
          // Tailwind v4's individual transforms otherwise compose with v3's transform.
          for (const prop of ["translate", "rotate", "scale"])
            rule.append({ prop, value: "none" });
        }
      }
    });
    root.walkDecls((declaration) => {
      declaration.prop = declaration.prop.replaceAll("--tw-", "--ajna-tw-");
      declaration.value = declaration.value.replaceAll("--tw-", "--ajna-tw-");
    });
  },
};

export async function buildStyles() {
  const theme = JSON.parse(
    await import("node:fs/promises").then((m) =>
      m.readFile(new URL("../src/styles/theme.json", import.meta.url), "utf8"),
    ),
  );
  const mode = (index) =>
    [
      ...Object.entries(theme.colors).map(([name, values]) => [
        `ajna-${name}`,
        values,
      ]),
      ...Object.entries(theme.sidebarColors),
    ]
      .map(([name, values]) => `  --${name}: ${values[index]};`)
      .join("\n");
  const tokens = `/* Generated from src/styles/theme.json. Color tokens contain HSL channels. */\n:root {\n${mode(0)}\n  --ajna-radius: ${theme.radius};\n}\n:root.dark {\n${mode(1)}\n}\n`;
  const { writeFile, copyFile } = await import("node:fs/promises");
  await writeFile(new URL("../dist/tokens.css", import.meta.url), tokens);
  await copyFile(
    new URL("../src/styles/theme.json", import.meta.url),
    new URL("../dist/theme.json", import.meta.url),
  );
  await copyFile(
    new URL("../src/styles/tailwind.preset.cjs", import.meta.url),
    new URL("../dist/tailwind.cjs", import.meta.url),
  );
  await copyFile(
    new URL("../src/styles/tailwind.d.cts", import.meta.url),
    new URL("../dist/tailwind.d.cts", import.meta.url),
  );

  const plugin = {
    ...scopeUtilities,
    OnceExit(root) {
      root.walkRules((rule) => {
        if (
          rule.parent &&
          rule.parent.type === "atrule" &&
          rule.parent.name &&
          rule.parent.name.endsWith("keyframes")
        )
          return;
        const declarations = rule.nodes.filter((node) => node.type === "decl");
        if (
          [":root", ':root[class~="dark"]'].includes(rule.selector) &&
          declarations.every(
            (node) =>
              node.prop.startsWith("--ajna-") ||
              Object.hasOwn(theme.sidebarColors, node.prop.slice(2)),
          )
        )
          return;
        if (
          declarations.length &&
          declarations.every((node) => node.prop.startsWith("--tw-")) &&
          rule.selectors.every((selector) =>
            ["*", "::before", "::after", "::backdrop"].includes(selector),
          )
        ) {
          if (rule.selector === "::backdrop") {
            rule.remove();
            return;
          }
          rule.selector =
            "[data-ajna-component], [data-ajna-component]::before, [data-ajna-component]::after";
        } else {
          // :where keeps specificity equal to the consumer's own utility classes.
          rule.selectors = rule.selectors.map(
            (selector) => `:where([data-ajna-component])${selector}`,
          );
          if (declarations.some((node) => node.prop === "transform")) {
            // Tailwind v4's individual transforms otherwise compose with v3's transform.
            for (const prop of ["translate", "rotate", "scale"])
              rule.append({ prop, value: "none" });
          }
        }
      });
      root.walkDecls((declaration) => {
        declaration.prop = declaration.prop.replaceAll("--tw-", "--ajna-tw-");
        declaration.value = declaration.value.replaceAll("--tw-", "--ajna-tw-");
      });
    },
  };

  const result = await postcss([
    tailwindcss(
      fileURLToPath(new URL("../tailwind.config.cjs", import.meta.url)),
    ),
    autoprefixer(),
    plugin,
  ]).process("@tailwind base;\n@tailwind utilities;", {
    from: undefined,
    map: false,
  });
  await writeFile(new URL("../dist/styles.css", import.meta.url), result.css);
  console.log("Built styles, tokens, and copied preset files.");
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  await buildStyles();
}
