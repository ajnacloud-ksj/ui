/**
 * SRP-6a as Amazon Cognito runs it for USER_SRP_AUTH: the password never leaves the browser.
 *
 * The group is the RFC 5054 3072-bit prime with g = 2. Hashes are SHA-256, and every hex value is
 * padded as Cognito expects (even length, a leading 00 when the top bit is set). Each step is
 * checked against the reference implementation (amazon-cognito-identity-js) and an independent
 * server in srp.test.ts.
 */

export class SrpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SrpError";
  }
}

const N_HEX =
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
  "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F" +
  "83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B" +
  "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA0510" +
  "15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7" +
  "ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
  "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF";

export const N: bigint = BigInt("0x" + N_HEX);
export const G = 2n;

const INFO_BITS = new TextEncoder().encode("Caldera Derived Key\u0001");
const SMALL_A_BYTES = 128;
const DERIVED_KEY_BYTES = 16;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type RandomBytes = (count: number) => Uint8Array;

/** Even-length hex, with "00" prepended when the most significant bit is set. */
export function padHex(value: bigint): string {
  if (value < 0n)
    throw new SrpError("padHex: negative values are not used by SRP");
  let hex = value.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  return /^[89a-f]/.test(hex) ? "00" + hex : hex;
}

/** b^e mod m, by square and multiply. */
export function modPow(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  let b = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    e >>= 1n;
    b = (b * b) % modulus;
  }
  return result;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function concat(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

async function sha256(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function hexHash(hex: string): Promise<string> {
  return bytesToHex(await sha256(hexToBytes(hex)));
}

async function hmacSha256(
  key: Uint8Array<ArrayBuffer>,
  data: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}

let kPromise: Promise<bigint> | undefined;

/** k = H(pad(N) | pad(g)), derived once and cached. */
export function computeK(): Promise<bigint> {
  kPromise ??= hexHash(padHex(N) + padHex(G)).then((h) => BigInt("0x" + h));
  return kPromise;
}

/** The pool name Cognito hashes: the part of the pool id after the region ("ap-south-1_ABC" -> "ABC"). */
export function poolNameOf(poolId: string): string {
  const parts = poolId.split("_");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new SrpError("poolNameOf: a pool id has the form <region>_<name>");
  }
  return parts[1];
}

/** The private value a: 128 random bytes as a positive integer. */
export function generateSmallA(
  randomBytes: RandomBytes = defaultRandomBytes,
): bigint {
  const bytes = randomBytes(SMALL_A_BYTES);
  if (bytes.length !== SMALL_A_BYTES)
    throw new SrpError("generateSmallA: wrong random length");
  const a = BigInt("0x" + bytesToHex(bytes));
  if (a === 0n) throw new SrpError("generateSmallA: the random value is zero");
  return a;
}

function defaultRandomBytes(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
}

/** A = g^a mod N; never 0. */
export function calculateA(smallA: bigint): bigint {
  const A = modPow(G, smallA, N);
  if (A % N === 0n) throw new SrpError("calculateA: A mod N is 0");
  return A;
}

export interface PasswordKeyInput {
  poolName: string;
  /** USER_ID_FOR_SRP from the PASSWORD_VERIFIER challenge, not the typed email. */
  userId: string;
  password: string;
  serverB: bigint;
  salt: bigint;
  smallA: bigint;
}

/** The 16-byte key: HKDF(S, u) with Cognito's info string. */
export async function passwordAuthenticationKey(
  input: PasswordKeyInput,
): Promise<Uint8Array> {
  const { poolName, userId, password, serverB, salt, smallA } = input;
  if (serverB % N === 0n)
    throw new SrpError("passwordAuthenticationKey: B mod N is 0");
  const A = calculateA(smallA);
  const u = BigInt("0x" + (await hexHash(padHex(A) + padHex(serverB))));
  if (u === 0n) throw new SrpError("passwordAuthenticationKey: u is 0");

  const inner = bytesToHex(
    await sha256(new TextEncoder().encode(`${poolName}${userId}:${password}`)),
  );
  const x = BigInt("0x" + (await hexHash(padHex(salt) + inner)));
  const base = serverB - (await computeK()) * modPow(G, x, N);
  const S = modPow(base, smallA + u * x, N);

  const prk = await hmacSha256(hexToBytes(padHex(u)), hexToBytes(padHex(S)));
  const okm = await hmacSha256(prk, INFO_BITS);
  return okm.slice(0, DERIVED_KEY_BYTES);
}

export interface ClaimInput {
  key: Uint8Array;
  poolName: string;
  userId: string;
  /** SECRET_BLOCK from the challenge, base64 as Cognito sends it. */
  secretBlock: string;
  timestamp: string;
}

/** PASSWORD_CLAIM_SIGNATURE = base64(HMAC-SHA256(key, poolName | userId | secretBlock | timestamp)). */
export async function passwordClaimSignature(
  input: ClaimInput,
): Promise<string> {
  const encoder = new TextEncoder();
  const message = concat(
    encoder.encode(input.poolName),
    encoder.encode(input.userId),
    base64ToBytes(input.secretBlock),
    encoder.encode(input.timestamp),
  );
  return bytesToBase64(await hmacSha256(new Uint8Array(input.key), message));
}

/** The TIMESTAMP Cognito expects: "ddd MMM D HH:mm:ss UTC YYYY", in UTC, day not padded. */
export function formatTimestamp(now: Date): string {
  const two = (n: number): string => String(n).padStart(2, "0");
  return (
    `${WEEKDAYS[now.getUTCDay()]} ${MONTHS[now.getUTCMonth()]} ${now.getUTCDate()} ` +
    `${two(now.getUTCHours())}:${two(now.getUTCMinutes())}:${two(now.getUTCSeconds())} UTC ${now.getUTCFullYear()}`
  );
}
