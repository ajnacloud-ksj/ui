import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "tsdown";

import { buildStyles } from "./scripts/postcss-scope-utilities.mjs";

const manifest = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);
const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const entry = Object.fromEntries(
  Object.keys(manifest.exports)
    .filter(
      (subpath) =>
        !["./styles.css", "./tokens.css", "./tailwind"].includes(subpath),
    )
    .map((subpath) => {
      const name = subpath === "." ? "index" : subpath.slice(2);
      const source =
        name === "index"
          ? "src/index.ts"
          : name === "utils" || name === "primitives"
            ? `src/${name}/index.ts`
            : name.startsWith("primitives/")
              ? `src/${name}.ts`
              : `src/components/${name}/index.ts`;
      return [name, source];
    }),
);
const dependencies = Object.keys({
  ...manifest.dependencies,
  ...manifest.peerDependencies,
});

export default defineConfig({
  cwd: packageRoot,
  entry,
  format: "esm",
  platform: "neutral",
  target: "es2020",
  fixedExtension: false,
  tsconfig: "tsconfig.build.json",
  dts: { generator: "tsc" },
  clean: true,
  outDir: "dist",
  deps: {
    neverBundle: (id) =>
      dependencies.some((name) => id === name || id.startsWith(`${name}/`)),
    onlyBundle: [],
  },
  plugins: [
    {
      name: "ajna-style-inputs",
      buildStart() {
        for (const file of [
          "src/styles/theme.json",
          "src/styles/tailwind.preset.cjs",
          "src/styles/tailwind.d.cts",
          "tailwind.config.cjs",
        ]) {
          this.addWatchFile(fileURLToPath(new URL(file, import.meta.url)));
        }
      },
    },
    {
      name: "ajna-client-directive",
      transform: {
        filter: { id: /\/src\/.*\.[jt]sx?$/ },
        handler(code) {
          // The banner restores client boundaries on the public entries.
          return { code: code.replace(/^["']use client["'];?/, ""), map: null };
        },
      },
    },
  ],
  outputOptions: {
    banner: ({ isEntry, name, fileName }) =>
      isEntry && name !== "utils" && fileName.endsWith(".js")
        ? '"use client";'
        : "",
  },
  hooks: { "build:done": buildStyles },
});
