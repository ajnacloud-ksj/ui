import { describe, expect, it } from "vitest";

import { expandLoginId, LoginIdError, NO_EMAIL_DOMAIN } from "./login-id";

describe("expandLoginId (spec C-temp: no-email accounts)", () => {
  it("keeps an email as typed, trimmed and lowercased", () => {
    expect(expandLoginId("  Ravi.K@Example.COM ", "acme")).toBe("ravi.k@example.com");
  });

  it("keeps an email even without an org context", () => {
    expect(expandLoginId("ravi@example.com", null)).toBe("ravi@example.com");
  });

  it("expands a bare handle with the org from the sign-in context", () => {
    expect(expandLoginId("picker07", "acme")).toBe(`picker07.acme@${NO_EMAIL_DOMAIN}`);
  });

  it("uses the reserved .invalid domain (RFC 2606), which can never receive mail", () => {
    expect(NO_EMAIL_DOMAIN).toBe("users.invalid");
  });

  it("lowercases and trims a handle", () => {
    expect(expandLoginId(" Picker.07 ", "acme")).toBe(`picker.07.acme@${NO_EMAIL_DOMAIN}`);
  });

  it("refuses a bare handle when the page has no org context", () => {
    expect(() => expandLoginId("picker07", null)).toThrow(LoginIdError);
    try {
      expandLoginId("picker07", null);
    } catch (err) {
      expect((err as LoginIdError).code).toBe("login_id_needs_org");
    }
  });

  it.each(["", "   ", "pick er", "picker..07", ".picker", "picker.", "pick/er", "a".repeat(65), "pïcker"])(
    "refuses the handle %j",
    (bad) => {
      expect(() => expandLoginId(bad, "acme")).toThrow(LoginIdError);
    },
  );

  it.each(["", "Acme", "ac me", "-acme", "a".repeat(64), "acme.evil"])("refuses the org slug %j", (org) => {
    expect(() => expandLoginId("picker07", org)).toThrow(LoginIdError);
  });

  it("does not let a handle smuggle in another domain", () => {
    expect(() => expandLoginId("picker07@users.invalid", "acme")).not.toThrow();
    expect(expandLoginId("picker07@users.invalid", "acme")).toBe("picker07@users.invalid");
    // A bare handle can never produce an "@" of its own choice.
    expect(() => expandLoginId("picker07.evil.com", "acme")).not.toThrow();
    expect(expandLoginId("picker07.evil.com", "acme")).toBe(`picker07.evil.com.acme@${NO_EMAIL_DOMAIN}`);
  });
});
