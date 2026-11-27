// The public-content guard for a PACKED tarball: the release workflow runs it on the exact .tgz it
// publishes, so a built file (dist/, a copied asset) cannot carry what the source scan would
// refuse. Same rules as scripts/check-public-content.mjs (.github/public-content-patterns.json).
//
//   node scripts/check-packed-content.mjs <package.tgz>
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRules, scanText } from "./check-public-content.mjs";

/** Every hit in every file of the tarball: {files, hits}. */
export async function scanTarball(tarball, rules) {
  if (!/\.tgz$/.test(tarball)) throw new Error(`not a .tgz: ${tarball}`);
  const dir = await mkdtemp(join(tmpdir(), "packed-content-"));
  try {
    execFileSync("tar", ["-xzf", tarball, "-C", dir]);
    let files = 0;
    const hits = [];
    for (const entry of await readdir(dir, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (!entry.isFile()) continue;
      const path = join(entry.parentPath ?? entry.path, entry.name);
      files += 1;
      hits.push(
        ...scanText(relative(dir, path), await readFile(path, "utf8"), rules),
      );
    }
    return { files, hits };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function main() {
  const tarball = process.argv[2];
  if (!tarball)
    throw new Error("usage: check-packed-content.mjs <package.tgz>");
  const { files, hits } = await scanTarball(tarball, await loadRules());
  for (const hit of hits) {
    // Masked like the source guard: the rule and place, never the full value.
    console.error(`${hit.file}:${hit.line}: ${hit.rule}: ${hit.message}`);
  }
  if (files === 0) throw new Error(`${tarball} holds no files`);
  console.log(`packed-content guard: ${files} files, ${hits.length} hits`);
  if (hits.length) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
