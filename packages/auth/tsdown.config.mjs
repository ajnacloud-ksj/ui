import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "tsdown";

const manifest = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);
const dependencies = Object.keys({
  ...manifest.dependencies,
  ...manifest.peerDependencies,
});

export default defineConfig({
  cwd: fileURLToPath(new URL(".", import.meta.url)),
  entry: {
    signin: "src/signin/index.ts",
    session: "src/session/index.ts",
    members: "src/members/index.ts",
  },
  format: "esm",
  platform: "neutral",
  target: "es2022",
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
  outputOptions: {
    banner: ({ isEntry, fileName }) =>
      isEntry && fileName.endsWith(".js") ? '"use client";' : "",
  },
});
