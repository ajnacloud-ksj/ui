// Packs @ajnacloud/auth and checks the tarball: publint, attw, and that nothing test-only ships.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "ajna-auth-package-"));
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
  run("tar", ["-xzf", archive, "-C", temporary]);
  const unpacked = join(temporary, "package");

  const files = (
    await readdir(join(unpacked, "dist"), { recursive: true })
  ).sort();
  // One entry, no chunks: anything else means the bundler pulled in a module it should not.
  assert.deepEqual(
    files,
    ["index.d.ts", "index.js"],
    `unexpected files in dist: ${files.join(", ")}`,
  );
  for (const name of files) {
    assert(!/\.(test|spec)\./.test(name), `test artifact in package: ${name}`);
    assert(
      !/testing|fake-cognito/.test(name),
      `test-only module in package: ${name}`,
    );
    if (!/\.(js|d\.ts)$/.test(name)) continue;
    const content = await readFile(join(unpacked, "dist", name), "utf8");
    // The reference SRP library is a test-only dev dependency; it must never reach users.
    // Test-only code must not ship in ANY form: imported, inlined or named.
    for (const marker of [
      "amazon-cognito-identity-js",
      "AmazonCognitoIdentity",
      "fake-cognito",
      "FakeCognito",
      "src/testing",
    ]) {
      assert(
        !content.includes(marker),
        `${name} contains test-only code: ${marker}`,
      );
    }
    assert.doesNotMatch(
      content,
      /FakeCognito/,
      `${name} contains the fake pool`,
    );
  }

  const manifest = JSON.parse(
    await readFile(join(unpacked, "package.json"), "utf8"),
  );
  assert.equal(
    manifest.private,
    true,
    "the package stays private until a publish is requested (AGENTS.md)",
  );
  assert.deepEqual(Object.keys(manifest.dependencies ?? {}), [
    "@aws-sdk/client-cognito-identity-provider",
  ]);

  run("pnpm", ["exec", "publint", unpacked]);
  run("pnpm", ["exec", "attw", "--pack", unpacked, "--profile", "esm-only"]);
  console.info("package check: ok");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
