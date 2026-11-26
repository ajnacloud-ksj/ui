// @vitest-environment node
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import {
  calculateA,
  computeK,
  formatTimestamp,
  G,
  generateSmallA,
  modPow,
  N,
  padHex,
  passwordAuthenticationKey,
  passwordClaimSignature,
  poolNameOf,
  SrpError,
} from "./srp";

// The test-only reference: amazon-cognito-identity-js (CommonJS), loaded with require so its
// `exports.default` classes are used as published.
interface ReferenceBigInteger {
  toString(radix: number): string;
}
interface ReferenceHelperInstance {
  smallAValue: ReferenceBigInteger;
  largeAValue?: ReferenceBigInteger;
  k: ReferenceBigInteger;
  getLargeAValue(cb: (err: unknown, value: ReferenceBigInteger) => void): void;
  getPasswordAuthenticationKey(
    username: string,
    password: string,
    serverB: ReferenceBigInteger,
    salt: ReferenceBigInteger,
    cb: (err: unknown, key: Uint8Array) => void,
  ): void;
}
const require = createRequire(import.meta.url);
const ReferenceHelper: new (poolName: string) => ReferenceHelperInstance =
  require("amazon-cognito-identity-js/lib/AuthenticationHelper.js").default;
const ReferenceBigInteger: new (
  value: string,
  radix: number,
) => ReferenceBigInteger =
  require("amazon-cognito-identity-js/lib/BigInteger.js").default;

/** A reference helper with OUR fixed a. Its constructor caches A from a random a, so clear it. */
function referenceWithFixedA(): ReferenceHelperInstance {
  const helper = new ReferenceHelper(POOL_NAME);
  helper.smallAValue = new ReferenceBigInteger(SMALL_A_HEX, 16);
  helper.largeAValue = undefined;
  return helper;
}

const POOL_ID = "ap-south-1_TestPool1";
const POOL_NAME = "TestPool1";
const USER_ID = "3c1f0a52-8d1e-4f7e-9b2a-0d6f2e9a1b77";
const PASSWORD = "Correct-Horse-9-battery";
const SALT_HEX = "9e1c5bd7a8f04c2b11aa";
// Fixed private values, so both implementations see the same randomness.
const SMALL_A_HEX = "a1".repeat(128);
const SMALL_B = BigInt("0x" + "5c".repeat(32));

const hex = (n: bigint): string => n.toString(16);
const sha256Hex = async (bytes: Uint8Array): Promise<string> =>
  Buffer.from(
    await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)),
  ).toString("hex");

// An independent SRP server for the same user: v = g^x, B = k*v + g^b (mod N).
async function fakeServer(): Promise<{
  B: bigint;
  salt: bigint;
  v: bigint;
  x: bigint;
}> {
  const salt = BigInt("0x" + SALT_HEX);
  const inner = await sha256Hex(
    new TextEncoder().encode(`${POOL_NAME}${USER_ID}:${PASSWORD}`),
  );
  const x = BigInt(
    "0x" + (await sha256Hex(Buffer.from(padHex(salt) + inner, "hex"))),
  );
  const v = modPow(G, x, N);
  const k = await computeK();
  const B = (k * v + modPow(G, SMALL_B, N)) % N;
  return { B, salt, v, x };
}

function referenceKey(B: bigint, salt: bigint): Promise<Uint8Array> {
  const helper = referenceWithFixedA();
  return new Promise((resolve, reject) => {
    helper.getLargeAValue((errA) => {
      if (errA) return reject(errA);
      helper.getPasswordAuthenticationKey(
        USER_ID,
        PASSWORD,
        new ReferenceBigInteger(hex(B), 16),
        new ReferenceBigInteger(hex(salt), 16),
        (err, key) => (err ? reject(err) : resolve(new Uint8Array(key))),
      );
    });
  });
}

describe("padHex", () => {
  it.each([
    [0x14n, "14"],
    [0x38n, "38"],
    [0xecn, "00ec"],
    [0xc8n, "00c8"],
    [0x1n, "01"],
    [0x7fffn, "7fff"],
    [0x8000n, "008000"],
  ])("pads %s to %s", (value, expected) => {
    expect(padHex(value)).toBe(expected);
  });

  it("refuses a negative value (SRP never needs one)", () => {
    expect(() => padHex(-1n)).toThrow(SrpError);
  });
});

describe("constants", () => {
  it("uses the RFC 5054 3072-bit group with g = 2", () => {
    expect(N.toString(2)).toHaveLength(3072);
    expect(G).toBe(2n);
  });

  it("derives k = H(pad(N) | pad(g)) as the reference does", async () => {
    const helper = new ReferenceHelper(POOL_NAME);
    expect((await computeK()).toString(16)).toBe(helper.k.toString(16));
  });
});

describe("poolNameOf", () => {
  it("takes the part after the region", () => {
    expect(poolNameOf(POOL_ID)).toBe(POOL_NAME);
  });

  it.each(["", "nounderscore", "ap-south-1_", "_abc", "a_b_c"])(
    "refuses %j",
    (bad) => {
      expect(() => poolNameOf(bad)).toThrow(SrpError);
    },
  );
});

describe("generateSmallA", () => {
  it("draws 128 random bytes as a positive integer", () => {
    const fixed = new Uint8Array(128).fill(0xa1);
    expect(generateSmallA(() => fixed)).toBe(BigInt("0x" + SMALL_A_HEX));
  });

  it("asks for exactly 128 bytes", () => {
    let asked = 0;
    generateSmallA((n: number) => {
      asked = n;
      return new Uint8Array(n).fill(1);
    });
    expect(asked).toBe(128);
  });

  it("refuses a zero value", () => {
    expect(() => generateSmallA((n: number) => new Uint8Array(n))).toThrow(
      SrpError,
    );
  });
});

describe("calculateA", () => {
  it("matches the reference A for the same a", async () => {
    const helper = referenceWithFixedA();
    const refA = await new Promise<string>((resolve, reject) =>
      helper.getLargeAValue((err, value) =>
        err ? reject(err) : resolve(value.toString(16)),
      ),
    );
    expect(hex(calculateA(BigInt("0x" + SMALL_A_HEX)))).toBe(refA);
  });
});

describe("passwordAuthenticationKey", () => {
  it("matches the reference implementation byte for byte", async () => {
    const { B, salt } = await fakeServer();
    const a = BigInt("0x" + SMALL_A_HEX);
    const ours = await passwordAuthenticationKey({
      poolName: POOL_NAME,
      userId: USER_ID,
      password: PASSWORD,
      serverB: B,
      salt,
      smallA: a,
    });
    expect(Buffer.from(ours).toString("hex")).toBe(
      Buffer.from(await referenceKey(B, salt)).toString("hex"),
    );
    expect(ours).toHaveLength(16);
  });

  it("agrees with an independent server's key (S_client == S_server)", async () => {
    const { B, salt, v } = await fakeServer();
    const a = BigInt("0x" + SMALL_A_HEX);
    const A = calculateA(a);
    const u = BigInt(
      "0x" + (await sha256Hex(Buffer.from(padHex(A) + padHex(B), "hex"))),
    );
    // Server side: S = (A * v^u)^b mod N, then the same HKDF.
    const serverS = modPow((A * modPow(v, u, N)) % N, SMALL_B, N);
    const prk = createHmac("sha256", Buffer.from(padHex(u), "hex"))
      .update(Buffer.from(padHex(serverS), "hex"))
      .digest();
    const serverKey = createHmac("sha256", prk)
      .update(
        Buffer.concat([
          Buffer.from("Caldera Derived Key", "utf8"),
          Buffer.from([1]),
        ]),
      )
      .digest()
      .subarray(0, 16);

    const ours = await passwordAuthenticationKey({
      poolName: POOL_NAME,
      userId: USER_ID,
      password: PASSWORD,
      serverB: B,
      salt,
      smallA: a,
    });
    expect(Buffer.from(ours).toString("hex")).toBe(serverKey.toString("hex"));
  });

  it("gives a different key for a wrong password", async () => {
    const { B, salt } = await fakeServer();
    const args = {
      poolName: POOL_NAME,
      userId: USER_ID,
      serverB: B,
      salt,
      smallA: BigInt("0x" + SMALL_A_HEX),
    };
    const right = await passwordAuthenticationKey({
      ...args,
      password: PASSWORD,
    });
    const wrong = await passwordAuthenticationKey({
      ...args,
      password: PASSWORD + "x",
    });
    expect(Buffer.from(right).equals(Buffer.from(wrong))).toBe(false);
  });

  it("refuses B = 0 mod N (a malicious or broken server)", async () => {
    await expect(
      passwordAuthenticationKey({
        poolName: POOL_NAME,
        userId: USER_ID,
        password: PASSWORD,
        serverB: N * 3n,
        salt: 1n,
        smallA: BigInt("0x" + SMALL_A_HEX),
      }),
    ).rejects.toThrow(SrpError);
  });
});

describe("passwordClaimSignature", () => {
  it("is base64(HMAC-SHA256(key, poolName | userId | secretBlock | timestamp))", async () => {
    const key = new Uint8Array(16).map((_, i) => i * 7);
    const secretBlock = Buffer.from("opaque-secret-block-bytes").toString(
      "base64",
    );
    const timestamp = "Thu Nov 26 05:04:03 UTC 2026";
    const expected = createHmac("sha256", key)
      .update(
        Buffer.concat([
          Buffer.from(POOL_NAME, "utf8"),
          Buffer.from(USER_ID, "utf8"),
          Buffer.from(secretBlock, "base64"),
          Buffer.from(timestamp, "utf8"),
        ]),
      )
      .digest("base64");
    await expect(
      passwordClaimSignature({
        key,
        poolName: POOL_NAME,
        userId: USER_ID,
        secretBlock,
        timestamp,
      }),
    ).resolves.toBe(expected);
  });
});

describe("formatTimestamp", () => {
  it("writes ddd MMM D HH:mm:ss UTC YYYY with an unpadded day", () => {
    expect(formatTimestamp(new Date(Date.UTC(2026, 10, 3, 5, 4, 3)))).toBe(
      "Tue Nov 3 05:04:03 UTC 2026",
    );
  });

  it("uses UTC, never the local time zone", () => {
    expect(formatTimestamp(new Date("2026-11-26T23:59:59.000Z"))).toBe(
      "Thu Nov 26 23:59:59 UTC 2026",
    );
  });
});
