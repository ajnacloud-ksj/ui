import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const workspaceRoot = fileURLToPath(new URL("../../..", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "ajna-package-"));
const run = (command, args, cwd = packageRoot) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

try {
  run("pnpm", [
    "--config.ignore-scripts=true",
    "pack",
    "--pack-destination",
    temporary,
  ]);
  const archive = join(
    temporary,
    (await readdir(temporary)).find((name) => name.endsWith(".tgz")),
  );
  const installed = join(temporary, "node_modules/@ajnacloud/ui");
  await mkdir(installed, { recursive: true });
  run("tar", ["-xzf", archive, "-C", installed, "--strip-components=1"]);
  const manifest = JSON.parse(
    await readFile(join(installed, "package.json"), "utf8"),
  );
  const entries = Object.entries(manifest.exports);
  for (const [subpath, conditions] of entries) {
    for (const target of typeof conditions === "string"
      ? [conditions]
      : Object.values(conditions)) {
      await assert.doesNotReject(
        readFile(join(installed, target)),
        `${subpath} must have a packed target at ${target}`,
      );
    }
  }

  for (const name of await readdir(join(installed, "dist"), {
    recursive: true,
  })) {
    assert(!/\.(test|spec)\./.test(name), `Test artifact in package: ${name}`);
    if (!/\.(js|d\.ts)$/.test(name)) continue;
    const content = await readFile(join(installed, "dist", name), "utf8");
    if (name.endsWith(".d.ts")) {
      assert.doesNotMatch(
        content,
        /@internationalized\/date|\b(?:CalendarDate|DateValue|DatePickerState)\b/,
        `Date-library types leaked into ${name}`,
      );
    }
    assert(
      !/vitest|@\/|from ["'](?:\.\.\/)*src\//.test(content),
      `Unresolved or test dependency in ${name}`,
    );
  }

  // The platform sign-in code (src/auth): three subpaths, nothing test-only, and the root entry
  // never reaches it or its optional peers, so an app that does not sign in carries none of it.
  for (const subpath of ["./signin", "./session", "./members"]) {
    assert(manifest.exports[subpath], `missing export ${subpath}`);
  }
  for (const peer of ["@aws-sdk/client-cognito-identity-provider", "axios"]) {
    assert.deepEqual(manifest.peerDependenciesMeta?.[peer], { optional: true });
    assert(!manifest.dependencies?.[peer], `${peer} must be an optional peer`);
  }
  for (const name of await readdir(join(installed, "dist"), {
    recursive: true,
  })) {
    assert(!/testing|fake-cognito/.test(name), `test-only module: ${name}`);
    if (!/\.(js|d\.ts)$/.test(name)) continue;
    const content = await readFile(join(installed, "dist", name), "utf8");
    for (const marker of [
      "amazon-cognito-identity-js",
      "AmazonCognitoIdentity",
      "FakeCognito",
      "fake-cognito",
      "stubSessionEnv",
      "testing/env",
    ]) {
      assert(
        !content.includes(marker),
        `${name} contains test-only code: ${marker}`,
      );
    }
  }
  const reachable = new Set();
  const walk = async (file) => {
    if (reachable.has(file)) return;
    reachable.add(file);
    const text = await readFile(join(installed, "dist", file), "utf8");
    for (const m of text.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      const spec = m[1];
      assert(
        !/^@aws-sdk\/|^axios$/.test(spec),
        `the root entry reaches ${spec} through ${file}`,
      );
      if (spec.startsWith(".")) await walk(join(dirname(file), spec));
    }
  };
  await walk("index.js");
  for (const file of reachable) {
    assert(
      !/^(signin|session|members)\.js$/.test(file),
      `the root entry reaches ${file}`,
    );
    const text = await readFile(join(installed, "dist", file), "utf8");
    assert(
      !/USER_SRP_AUTH|configureAppSession|MembersBlock/.test(text),
      `auth code in ${file}`,
    );
  }

  // Resolve dependencies from the workspace while testing only the packed Ajna files.
  for (const name of [
    ...Object.keys(manifest.dependencies),
    ...Object.keys(manifest.peerDependencies),
    "@types/react",
    "@types/react-dom",
    "tailwindcss",
  ]) {
    const target = await realpath(join(packageRoot, "node_modules", name));
    const destination = join(temporary, "node_modules", name);
    await mkdir(dirname(destination), { recursive: true });
    await symlink(target, destination, "dir");
  }

  const require = createRequire(join(temporary, "consumer.mjs"));
  for (const [subpath, conditions] of entries) {
    if (typeof conditions === "string") continue;
    const content = await readFile(join(installed, conditions.import), "utf8");
    if (subpath !== "./utils" && subpath !== "./tailwind") {
      assert.match(content, /^["']use client["'];/);
    } else {
      assert.doesNotMatch(content, /["']use client["']/);
    }
  }
  assert(require("@ajnacloud/ui/tailwind").theme);
  const specifiers = entries
    .filter(([, conditions]) => typeof conditions !== "string")
    .map(
      ([subpath]) => `@ajnacloud/ui${subpath === "." ? "" : subpath.slice(1)}`,
    );
  await writeFile(
    join(temporary, "consumer.mjs"),
    specifiers
      .map((specifier) => `await import(${JSON.stringify(specifier)});`)
      .join("\n"),
  );
  run(process.execPath, [join(temporary, "consumer.mjs")]);

  await writeFile(
    join(temporary, "consumer.mts"),
    [
      ...specifiers.map(
        (specifier, index) =>
          `import * as entry${index} from ${JSON.stringify(specifier)};\nvoid entry${index};`,
      ),
      'import { createElement } from "react";',
      'import { Button } from "@ajnacloud/ui/button";',
      'import { cn } from "@ajnacloud/ui/utils";',
      'import { QrCode, useQrCode, type QrCodeRootProps } from "@ajnacloud/ui/qr-code";',
      'const qrProps: QrCodeRootProps = { value: "PMG:L:12345", size: "xl", encoding: { ecc: "H" }, onValueChange: (details) => { const value: string = details.value; void value; } };',
      'createElement(QrCode.Root, qrProps, createElement(QrCode.Frame, { "aria-label": "Plant label" }));',
      'createElement(QrCode.DownloadTrigger, { fileName: "label", mimeType: "image/svg+xml" });',
      "void useQrCode;",
      'import { DateInput, type DateInputProps } from "@ajnacloud/ui/date-input";',
      'import { FilterBar, type FilterBarDefinition, type FilterBarDateRange } from "@ajnacloud/ui/filter-bar";',
      'const dateProps: DateInputProps = { value: "2026-04-12T23:30:00Z", minValue: "2026-01-01", onChange: (value) => { const date: string | null = value; void date; }, isDateUnavailable: (date) => date.endsWith("-01"), validate: (date) => date === null ? "Required" : null, className: (state) => state.isInvalid ? "invalid" : "" };',
      "createElement(DateInput, dateProps);",
      "type DateFilters = { date: string | null; range: FilterBarDateRange };",
      'const dateFilters: FilterBarDefinition<DateFilters>[] = [{ id: "date", type: "date", label: "Date", dateProps: { minValue: "2026-01-01" } }, { id: "range", type: "date-range", label: "Range" }];',
      'createElement(FilterBar<DateFilters>, { filters: dateFilters, value: { date: "2026-04-12", range: { start: null, end: null } }, resetValue: { date: null, range: { start: null, end: null } }, onValueChange: (values) => { const date: string | null = values.date; void date; }, formatDate: (date) => date });',
      'import preset from "@ajnacloud/ui/tailwind";',
      'createElement(Button, { variant: "outline", children: cn("px-2", "px-4") });',
      "preset.theme;",
    ].join("\n"),
  );
  const tsc = join(workspaceRoot, "node_modules/typescript/bin/tsc");
  for (const resolution of ["Bundler", "NodeNext"]) {
    run(
      process.execPath,
      [
        tsc,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "false",
        "--target",
        "ES2020",
        "--lib",
        "ES2022,ESNext.Intl,DOM,DOM.Iterable",
        "--module",
        resolution === "Bundler" ? "ESNext" : "NodeNext",
        "--moduleResolution",
        resolution,
        join(temporary, "consumer.mts"),
      ],
      temporary,
    );
  }
  run("pnpm", ["exec", "publint", "--strict", archive]);
  run("pnpm", [
    "exec",
    "attw",
    archive,
    "--profile",
    "esm-only",
    "--format",
    "table-flipped",
    "--exclude-entrypoints",
    "styles.css",
    "tokens.css",
  ]);
  console.log(
    "Packed exports, runtime imports, and Bundler/NodeNext consumer types passed.",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
