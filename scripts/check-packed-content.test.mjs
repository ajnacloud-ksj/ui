// Tests for the packed-tarball guard. Planted values are assembled at run time (the source guard
// scans this file too), and none is real.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

import { scanTarball } from "./check-packed-content.mjs";
import { loadRules } from "./check-public-content.mjs";

const rules = await loadRules();
const work = await mkdtemp(join(tmpdir(), "packed-content-test-"));
after(() => rm(work, { recursive: true, force: true }));

async function pack(name, files) {
  const root = join(work, name);
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(root, "package", path, ".."), { recursive: true });
    await writeFile(join(root, "package", path), text);
  }
  const tarball = join(work, `${name}.tgz`);
  execFileSync("tar", ["-czf", tarball, "-C", root, "package"]);
  return tarball;
}

test("a clean tarball passes and every file is counted", async () => {
  const tarball = await pack("clean", {
    "package.json": "{}",
    "dist/index.js": "export const a = 1;\n",
  });
  assert.deepEqual(await scanTarball(tarball, rules), { files: 2, hits: [] });
});

test("a planted id in a BUILT file fails", async () => {
  const host = ["api.", "aj", "na.cloud"].join("");
  const tarball = await pack("planted", {
    "dist/chunk.js": `fetch("https://${host}/v1");\n`,
  });
  const { hits } = await scanTarball(tarball, rules);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].file, join("package", "dist", "chunk.js"));
});

test("an allowed test fake passes", async () => {
  const fake = ["ap-south-1", "_TESTPOOL0"].join("");
  const tarball = await pack("fake", { "dist/a.js": `"${fake}"\n` });
  assert.equal((await scanTarball(tarball, rules)).hits.length, 0);
});

test("refuses a path that is not a .tgz", async () => {
  await assert.rejects(scanTarball(join(work, "x.tar"), rules), /not a \.tgz/);
});
