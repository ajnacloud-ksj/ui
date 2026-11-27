import { afterEach, describe, expect, it } from "vitest";

import { configureAppSession, sessionConfig } from "./config";
import { resolvePortalUrl } from "./portal-url";
import { resetSessionEnv } from "./testing/env";

const BASE = { fallbackPortalHost: "portal.example.test" };

afterEach(resetSessionEnv);

describe("configureAppSession portalOrgHost", () => {
  it.each([
    ["acme.example.test", "acme.example.test"],
    ["https://acme.example.test", "acme.example.test"],
    ["https://acme.example.test/", "acme.example.test"],
    ["ACME.Example.Test", "acme.example.test"],
    ["", ""],
    [undefined, ""],
  ])("accepts %j as %j", (value, stored) => {
    configureAppSession({ ...BASE, portalOrgHost: value });
    expect(sessionConfig().portalOrgHost).toBe(stored);
  });

  it.each([
    "http://acme.example.test", // not https
    "https://evil.example.org", // another zone
    "evil.example", // another zone
    "acme.example.test.evil.example", // the zone only as a prefix
    "https://user@acme.example.test", // userinfo
    "https://acme.example.test/path", // a path
    "https://acme.example.test:8443", // a port
    "acme.example.test?x=1", // a query
    "//acme.example.test", // protocol-relative
    "javascript:alert(1)",
    "*.example.test",
    "example.test", // the bare zone is not a portal host
  ])("refuses %j and keeps nothing", (value) => {
    expect(() =>
      configureAppSession({ ...BASE, portalOrgHost: value }),
    ).toThrow(/portalOrgHost/);
  });

  it("the redirect uses only the validated host", () => {
    configureAppSession({
      ...BASE,
      portalOrgHost: "https://acme.example.test/",
    });
    expect(resolvePortalUrl("app.example.test")).toBe(
      "https://acme.example.test",
    );
  });
});
