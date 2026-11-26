import { describe, expect, it } from "vitest";

import { resolveApiBase } from "./api-base";

const APEX = "https://myapp.example.test/api/v1";

describe("resolveApiBase", () => {
  it("keeps a tenant door on its OWN origin (the login-breaking case)", () => {
    // Regression: the door called the apex cross-origin with credentials, which a browser
    // refuses against the API's wildcard CORS, so login never left the page.
    // origin dropped, path preserved verbatim — the caller owns the /v1 convention
    expect(resolveApiBase(APEX, "https://acme.myapp.example.test")).toBe(
      "/api/v1",
    );
  });

  it("is relative on the apex too, since the API is same-origin there as well", () => {
    expect(resolveApiBase(APEX, "https://myapp.example.test")).toBe("/api/v1");
  });

  it("handles any door, including hyphenated tenants", () => {
    for (const origin of [
      "https://a.myapp.example.test",
      "https://big-co.myapp.example.test",
    ]) {
      expect(resolveApiBase(APEX, origin)).toBe("/api/v1");
    }
  });

  it("KEEPS an absolute url when the API genuinely lives on another host", () => {
    expect(
      resolveApiBase(
        "https://myappapi.example.test/v1",
        "https://myapp.example.test",
      ),
    ).toBe("https://myappapi.example.test/v1");
  });

  it("keeps a local backend on another port absolute (same host, different origin)", () => {
    // A hostname-only comparison would call the vite server and 404 every request.
    expect(
      resolveApiBase("http://localhost:8000", "http://localhost:5173"),
    ).toBe("http://localhost:8000");
  });

  it("does not treat a lookalike suffix as the same app", () => {
    expect(resolveApiBase(APEX, "https://notmyapp.example.test")).toBe(APEX);
  });

  it("does not treat a scheme mismatch as the same app", () => {
    expect(resolveApiBase(APEX, "http://myapp.example.test")).toBe(APEX);
  });

  it("passes relative and empty values through untouched", () => {
    expect(resolveApiBase("/api", "https://acme.myapp.example.test")).toBe(
      "/api",
    );
    expect(resolveApiBase(undefined, "https://acme.myapp.example.test")).toBe(
      "",
    );
  });

  it("leaves the caller's /v1 convention intact", () => {
    // origin-only: the caller appends or strips /v1 itself
    expect(
      resolveApiBase(
        "https://myapp.example.test/api",
        "https://acme.myapp.example.test",
      ),
    ).toBe("/api");
  });

  it("composes to exactly one /v1 the way api.ts builds the baseURL", () => {
    // mirrors api.ts: resolveApiBase(...) then normalise to exactly one trailing /v1
    const compose = (injected: string, origin: string) =>
      `${resolveApiBase(injected, origin).replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`;

    expect(compose(APEX, "https://acme.myapp.example.test")).toBe("/api/v1");
    expect(
      compose(
        "https://myapp.example.test/api",
        "https://acme.myapp.example.test",
      ),
    ).toBe("/api/v1");
    expect(
      compose("https://myappapi.example.test", "https://myapp.example.test"),
    ).toBe("https://myappapi.example.test/v1");
  });
});
