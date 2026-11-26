/**
 * Tenant from host: the app's own domain is not a tenant (ajna-app-ui-template#24,
 * ajnacloud-ksj/ajna-app-infra#310).
 *
 * The app's apex is already three labels (`myapp.example.test`), so "first label of a
 * 3+ label host" read the app's own name as a tenant: the login page showed "Workspace not
 * found", and every API call sent `X-Tenant-ID: myapp`, which the SDK treats as selecting a
 * tenant the user is not a member of.
 */
import { describe, expect, it } from "vitest";

import {
  appHostFromApiUrl,
  bareAppHost,
  classifyHost,
  defaultTenantDoorUrl,
  tenantFromHost,
} from "./tenant-host";

const APP = "myapp.example.test";

describe("appHostFromApiUrl", () => {
  it("takes the hostname of an absolute API url", () => {
    expect(appHostFromApiUrl("https://myapp.example.test/api/v1")).toBe(APP);
    expect(appHostFromApiUrl("https://MyApp.Example.Test./api")).toBe(APP);
  });

  it("is empty for a relative, missing or unparseable url", () => {
    expect(appHostFromApiUrl("/api/v1")).toBe("");
    expect(appHostFromApiUrl(undefined)).toBe("");
    expect(appHostFromApiUrl("https://")).toBe("");
  });
});

describe("tenantFromHost with the app host known", () => {
  it("returns no tenant on the bare app host", () => {
    expect(tenantFromHost("myapp.example.test", APP)).toBe("");
    expect(tenantFromHost("resident.example.org", "resident.example.org")).toBe(
      "",
    );
  });

  it("returns the tenant on a tenant door", () => {
    expect(tenantFromHost("acme.myapp.example.test", APP)).toBe("acme");
    expect(tenantFromHost("ACME.myapp.example.test.", APP)).toBe("acme");
  });

  it("keeps hyphens, the same as the Cognito group the SDK parses", () => {
    expect(tenantFromHost("foo-bar.myapp.example.test", APP)).toBe("foo-bar");
  });

  it("returns no tenant for a host nested deeper than one label", () => {
    expect(tenantFromHost("a.b.myapp.example.test", APP)).toBe("");
  });

  it("ignores a port", () => {
    expect(tenantFromHost("acme.myapp.example.test:443", APP)).toBe("acme");
  });
});

describe("www is never a tenant", () => {
  // `www` is a reserved org name. A `www.` host is an alias of the host it prefixes, so it
  // names no tenant. Sending `X-Tenant-ID: www` would select a tenant nobody is a member of.
  it("returns no tenant for www in front of the app host", () => {
    expect(tenantFromHost("www.myapp.example.test", APP)).toBe("");
    expect(tenantFromHost("WWW.myapp.example.test.", APP)).toBe("");
    expect(classifyHost("www.myapp.example.test", APP)).toEqual({
      kind: "other",
    });
  });

  it("returns no tenant for www by the zone shape or in local dev", () => {
    expect(
      tenantFromHost("www.myapp.example.test", "myapp-api.example.test"),
    ).toBe("");
    expect(tenantFromHost("www.myapp.example.test", "")).toBe("");
    expect(tenantFromHost("www.myapp.localhost", "")).toBe("");
  });

  it("returns no tenant for the www host of a platform zone", () => {
    expect(tenantFromHost("www.example.test", APP)).toBe("");
  });

  it("still reads a tenant whose slug only starts with www", () => {
    expect(tenantFromHost("wwwidgets.myapp.example.test", APP)).toBe(
      "wwwidgets",
    );
  });
});

describe("tenantFromHost when the page is not served under the app host", () => {
  // API on its own subdomain (apiMode: subdomain) or a relative API url.
  it("treats a 3-label host as the bare app host", () => {
    expect(tenantFromHost("myapp.example.test", "myapp-api.example.test")).toBe(
      "",
    );
    expect(tenantFromHost("myapp.example.test", "")).toBe("");
  });

  it("reads the first label of a 4+ label host as the tenant", () => {
    expect(
      tenantFromHost("acme.myapp.example.test", "myapp-api.example.test"),
    ).toBe("acme");
    expect(tenantFromHost("acme.myapp.example.test", "")).toBe("acme");
  });

  it("keeps the *.localhost dev model: acme.myapp.localhost is a door", () => {
    expect(tenantFromHost("acme.myapp.localhost", "localhost")).toBe("acme");
    expect(tenantFromHost("myapp.localhost", "localhost")).toBe("");
  });

  it("never reads a tenant from localhost or an IP address", () => {
    expect(tenantFromHost("localhost", "localhost")).toBe("");
    expect(tenantFromHost("127.0.0.1", "")).toBe("");
    expect(tenantFromHost("192.168.10.20", "")).toBe("");
  });
});

describe("tenantFromHost on hosts outside the platform zone", () => {
  it("does not read a tenant from a 4+ label BYO host when the API host names the zone", () => {
    expect(tenantFromHost("app.acme.co.uk", "myapp-api.example.test")).toBe("");
    expect(
      tenantFromHost("x.y.acme.example.test", "myapp-api.example.test"),
    ).toBe("");
  });

  it("treats the raw CloudFront host as the bare app host", () => {
    const cf = "d1234abcd.cloudfront.net";
    expect(classifyHost(cf, cf)).toEqual({ kind: "app", appHost: cf });
    expect(tenantFromHost(cf, cf)).toBe("");
  });
});

describe("classifyHost", () => {
  it("marks only an exact match with the app host as the bare app host", () => {
    expect(classifyHost("myapp.example.test", APP)).toEqual({
      kind: "app",
      appHost: APP,
    });
    expect(classifyHost("acme.myapp.example.test", APP)).toEqual({
      kind: "door",
      tenant: "acme",
      appHost: APP,
    });
    // Not provably the app's own domain (API elsewhere): no tenant, and no redirect.
    expect(classifyHost("myapp.example.test", "")).toEqual({ kind: "other" });
  });
});

describe("defaultTenantDoorUrl", () => {
  const here = {
    hostname: APP,
    protocol: "https:",
    port: "",
    pathname: "/login",
    search: "?sso=1",
  };

  it("sends the bare app host to the default tenant's door when one is configured", () => {
    expect(defaultTenantDoorUrl(here, APP, "ajna")).toBe(
      "https://ajna.myapp.example.test/login?sso=1",
    );
  });

  it("does nothing without a default tenant (prod has none by design)", () => {
    expect(defaultTenantDoorUrl(here, APP, "")).toBeNull();
  });

  it("does nothing on a tenant door or on a host that is not the app's own", () => {
    expect(
      defaultTenantDoorUrl({ ...here, hostname: `acme.${APP}` }, APP, "ajna"),
    ).toBeNull();
    expect(defaultTenantDoorUrl(here, "", "ajna")).toBeNull();
  });

  it("rejects a default tenant that is not a single DNS label", () => {
    expect(defaultTenantDoorUrl(here, APP, "evil.example.com/")).toBeNull();
    expect(defaultTenantDoorUrl(here, APP, "-bad")).toBeNull();
  });
});

describe("bareAppHost", () => {
  it("is the app host when the page is on it", () => {
    expect(bareAppHost(APP, APP)).toBe(APP);
  });

  it("uses the zone shape when the API is on its own subdomain", () => {
    expect(bareAppHost(APP, "myapp-api.example.test")).toBe(APP);
    expect(bareAppHost("app.acme.co.uk", "myapp-api.example.test")).toBe("");
  });

  it("is the local dev app host on *.localhost", () => {
    expect(bareAppHost("myapp.localhost", "")).toBe("myapp.localhost");
  });

  it("is empty on a door, localhost or an IP", () => {
    expect(bareAppHost("acme.myapp.example.test", APP)).toBe("");
    expect(bareAppHost("acme.myapp.localhost", "")).toBe("");
    expect(bareAppHost("localhost", APP)).toBe("");
    expect(bareAppHost("10.0.0.1", APP)).toBe("");
  });
});
