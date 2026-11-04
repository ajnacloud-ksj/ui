import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { Dialog as StyledDialog, DialogContent } from "@/components/dialog";

import * as primitives from ".";

const require = createRequire(import.meta.url);
const primitiveModules = import.meta.glob<Record<string, unknown>>([
  "./*.ts",
  "!./index.ts",
  "!./*.test.ts",
  "!./*.typecheck.ts",
]);
const baseUI = require("@base-ui/react/package.json");
const excluded = ["package.json", "types", "esm", "merge-props", "use-render"];
const subpaths = Object.keys(baseUI.exports)
  .filter((key) => key.startsWith("./") && !key.includes("/internals/"))
  .map((key) => key.slice(2))
  .filter((name) => !name.startsWith("unstable-") && !excluded.includes(name));

describe("Base UI primitive exports", () => {
  it.each(subpaths)(
    "preserves all runtime exports from %s",
    async (subpath) => {
      const moduleName = `@base-ui/react/${subpath}`;
      const original = await import(moduleName);
      const individual = await primitiveModules[`./${subpath}.ts`]();
      const barrel = primitives as Record<string, unknown>;
      for (const [name, value] of Object.entries(original)) {
        expect(individual[name]).toBe(value);
        expect(barrel[name]).toBe(value);
      }
      expect(Object.keys(individual).sort()).toEqual(
        Object.keys(original).sort(),
      );
    },
  );

  it("keeps raw primitives separate from styled components", () => {
    expect(primitives.Dialog).not.toBe(StyledDialog);
    expect(primitives.Dialog.Popup).toBeDefined();
    expect(primitives.Dialog.Root).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect("Root" in StyledDialog).toBe(false);
    expect("Title" in StyledDialog).toBe(false);
    expect("Content" in StyledDialog).toBe(false);
    expect("mergeProps" in primitives).toBe(false);
    expect("useRender" in primitives).toBe(false);
    expect("useMediaQuery" in primitives).toBe(false);
  });
});
