// The public-content guard: this repo is PUBLIC, so CI fails on any real Cognito pool id, AWS
// account id, AWS access key id or internal platform host in a tracked text file. The rules live
// in .github/public-content-patterns.json; test fakes are allowed only as exact strings.
//
//   node scripts/check-public-content.mjs        scan every tracked file
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RULES_PATH = new URL(
  "../.github/public-content-patterns.json",
  import.meta.url,
);

export async function loadRules(path = RULES_PATH) {
  const raw = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(raw.deny) || raw.deny.length === 0) {
    throw new Error(
      "public-content-patterns.json: `deny` must list at least one rule",
    );
  }
  return {
    deny: raw.deny.map((rule) => ({
      id: String(rule.id),
      message: String(rule.message),
      // "g" so every hit on a line is checked against the allow list, not only the first.
      regex: new RegExp(rule.pattern, `g${rule.flags ?? ""}`),
    })),
    allow: new Set((raw.allow ?? []).map(String)),
    skip: new Set((raw.skip ?? []).map(String)),
  };
}

/** Every hit in one file's text: [{file, line, rule, match}]. */
export function scanText(file, text, rules) {
  const hits = [];
  text.split("\n").forEach((content, index) => {
    for (const rule of rules.deny) {
      rule.regex.lastIndex = 0;
      for (const match of content.matchAll(rule.regex)) {
        if (rules.allow.has(match[0])) continue;
        hits.push({
          file,
          line: index + 1,
          rule: rule.id,
          message: rule.message,
          match: match[0],
        });
      }
    }
  });
  return hits;
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

async function main() {
  const rules = await loadRules();
  const hits = [];
  for (const file of trackedFiles()) {
    if (rules.skip.has(file)) continue;
    const bytes = await readFile(new URL(file, `file://${ROOT}`));
    if (bytes.includes(0)) continue; // binary
    hits.push(...scanText(file, bytes.toString("utf8"), rules));
  }
  if (hits.length === 0) {
    console.info("public-content guard: ok");
    return;
  }
  for (const hit of hits) {
    // The value is masked: a CI log of a public repo is public too.
    const masked = `${hit.match.slice(0, 4)}…(${hit.match.length} chars)`;
    console.error(
      `${hit.file}:${hit.line}: ${hit.message} [${hit.rule}] ${masked}`,
    );
  }
  console.error(
    `public-content guard: ${hits.length} hit(s). Remove the value, or (for a test fake only) ` +
      "add the exact string to `allow` in .github/public-content-patterns.json.",
  );
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
