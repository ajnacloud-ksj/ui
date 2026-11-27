// Tests for the public-content guard. Every planted value is ASSEMBLED at run time from pieces,
// so this file never holds an id-shaped string itself (the guard scans this file too). None of
// the values is real: the pool suffix, the account number and the key are made up.
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadRules, scanText } from "./check-public-content.mjs";

const rules = await loadRules();
const join = (...parts) => parts.join("");

const PLANTED = {
  pool: join("us-east-", "1_", "Ab3dE5", "gH9"),
  account: join("4040", "4040", "4040"),
  accessKey: join("AK", "IA", "Z".repeat(16)),
  sessionKey: join("AS", "IA", "Q".repeat(16)),
  devHost: join("myapp.", "triv", "iz.cloud"),
  orgDevHost: join("acme.", "sama", "gra.cloud"),
  orgProdHost: join("portal.", "var", "ah.cloud"),
  prodHost: join("api.", "aj", "na.cloud"),
};

for (const [name, value] of Object.entries(PLANTED)) {
  test(`fails on a planted ${name}`, () => {
    const hits = scanText("src/fixture.ts", `const x = "${value}";\n`, rules);
    assert.equal(hits.length, 1, `${name} was not caught`);
    assert.equal(hits[0].line, 1);
  });
}

test("allows the known test fakes, exactly", () => {
  for (const fake of rules.allow) {
    assert.deepEqual(scanText("a.test.ts", `"${fake}"`, rules), []);
  }
  // A look-alike of a fake is NOT allowed: the allow list is exact strings, not a pattern.
  const lookAlike = join("ap-south-", "1_", "TESTPOOL1");
  assert.equal(scanText("a.test.ts", `"${lookAlike}"`, rules).length, 1);
});

test("does not flag hex, long numbers or digits inside words", () => {
  const clean = [
    join("0x", "4040".repeat(3), "ab"), // hex run
    join("4040".repeat(3), "4"), // 13 digits
    join("v", "4040".repeat(3)), // inside a word
    "example.test portal.example.org cognito-idp.ap-south-1.amazonaws.com",
  ].join("\n");
  assert.deepEqual(scanText("src/x.ts", clean, rules), []);
});

test("reports the line of each hit", () => {
  const hits = scanText("x.md", `ok\nok\n${PLANTED.account}\n`, rules);
  assert.equal(hits[0].line, 3);
  assert.match(hits[0].rule, /account/);
});
