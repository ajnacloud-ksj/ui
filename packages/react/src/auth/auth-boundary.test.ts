// @vitest-environment node
// Keeps src/auth separable (owner, 2026-11-26: "later we will separate into a new lib"): the
// later split must be a move, not a rewrite.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));
const AUTH = join(SRC, "auth");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

function imports(file: string): string[] {
  const text = readFileSync(file, "utf8");
  // Static imports/exports at the start of a statement, and dynamic import("...") calls.
  const statement =
    /^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/gm;
  return [...text.matchAll(statement)].map((m) => m[1] ?? m[2] ?? m[3]);
}

// What src/auth may import besides its own files and the design components.
const AUTH_EXTERNALS = [
  "react",
  "react-dom",
  "@aws-sdk/client-cognito-identity-provider",
  "axios",
  // test-only
  "vitest",
  "@testing-library/react",
  "@testing-library/user-event",
  "amazon-cognito-identity-js",
  "node:",
];

describe("src/auth stays separable", () => {
  it("no design component, util or root entry imports from src/auth", () => {
    const offenders = sources(SRC)
      .filter((f) => !f.startsWith(AUTH))
      .flatMap((f) =>
        imports(f)
          .filter(
            (spec) =>
              /(^|\/)auth(\/|$)/.test(spec) &&
              (spec.startsWith(".") || spec.startsWith("@/")),
          )
          .map((spec) => `${relative(SRC, f)} -> ${spec}`),
      );
    expect(offenders).toEqual([]);
  });

  it("src/auth imports only itself, @/components/* and its listed packages", () => {
    const offenders = sources(AUTH).flatMap((f) =>
      imports(f)
        .filter((spec) => {
          if (spec.startsWith("."))
            return !join(f, "..", spec).startsWith(AUTH);
          if (spec.startsWith("@/"))
            return !/^@\/components\/[a-z-]+$/.test(spec);
          return !AUTH_EXTERNALS.some(
            (ok) =>
              spec === ok || spec.startsWith(ok.endsWith(":") ? ok : `${ok}/`),
          );
        })
        .map((spec) => `${relative(SRC, f)} -> ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("the root entry does not export the auth subpaths", () => {
    expect(readFileSync(join(SRC, "index.ts"), "utf8")).not.toMatch(/auth\//);
  });
});
