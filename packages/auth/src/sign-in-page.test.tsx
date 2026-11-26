import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AuthConfig } from "./http";
import type { SignInMachine, SignInState, StepResult } from "./machine";
import { noticeFromReason, SignInPage } from "./sign-in-page";

const CONFIG: AuthConfig = {
  poolId: "ap-south-1_TESTPOOL0",
  region: "ap-south-1",
  clientId: "testclient0",
  doorZone: "example.test",
  forgotPassword: true,
  mfaMode: "OPTIONAL",
  orgSlug: "acme",
  passwordPolicy: {
    minLength: 8,
    requireUpper: true,
    requireLower: true,
    requireDigit: true,
    requireSymbol: false,
  },
  branding: {
    displayName: "Acme",
    appDisplayName: "Plant Manager",
    logoUrl: null,
    primaryColor: null,
  },
  collectorUrl: null,
  bundleVersion: "test",
};

/** A scripted machine: each method returns the next queued result. */
function fakeMachine(initial: SignInState = { step: "password" }) {
  let state = initial;
  const queue: StepResult[] = [];
  const answer = vi.fn(async (): Promise<StepResult> => {
    const next = queue.shift() ?? { state };
    state = next.state;
    return next;
  });
  const machine: SignInMachine = {
    get state() {
      return state;
    },
    submitPassword: answer,
    submitTotp: answer,
    submitMfaSetupCode: answer,
    submitNewPassword: answer,
    startForgot: answer,
    confirmForgot: answer,
    backToPassword: vi.fn(() => {
      state = { step: "password" };
      return { state };
    }),
  };
  return { machine, queue: (r: StepResult) => queue.push(r), answer };
}

function renderPage(initial?: SignInState, config: AuthConfig = CONFIG) {
  const fake = fakeMachine(initial);
  const onDone = vi.fn();
  render(<SignInPage config={config} machine={fake.machine} onDone={onDone} />);
  return { ...fake, onDone, user: userEvent.setup() };
}

describe("password step", () => {
  it("submits the login ID and password to the machine", async () => {
    const { user, machine } = renderPage();
    await user.type(screen.getByTestId("signin-email"), "ravi@example.com");
    await user.type(screen.getByTestId("signin-password"), "Correct-Horse-9");
    await user.click(screen.getByTestId("signin-submit"));
    expect(machine.submitPassword).toHaveBeenCalledWith(
      "ravi@example.com",
      "Correct-Horse-9",
    );
  });

  it("shows one plain message for a failed sign-in", async () => {
    const { user, queue } = renderPage();
    queue({ state: { step: "password" }, error: "invalid_credentials" });
    await user.type(screen.getByTestId("signin-email"), "x@example.com");
    await user.type(screen.getByTestId("signin-password"), "nope-nope-1");
    await user.click(screen.getByTestId("signin-submit"));
    expect((await screen.findByTestId("signin-error")).textContent).toContain(
      "The email, Login ID or password is not correct. If you must reset your password, use Forgot password.",
    );
  });

  it("explains a threat-protection block", async () => {
    const { user, queue } = renderPage();
    queue({ state: { step: "password" }, error: "SIGN_IN_BLOCKED" });
    await user.type(screen.getByTestId("signin-email"), "x@example.com");
    await user.type(screen.getByTestId("signin-password"), "Correct-Horse-9");
    await user.click(screen.getByTestId("signin-submit"));
    expect((await screen.findByTestId("signin-error")).textContent).toMatch(
      /blocked.*Reset your password/,
    );
  });

  it("does not submit an empty form", async () => {
    const { user, machine } = renderPage();
    await user.click(screen.getByTestId("signin-submit"));
    expect(machine.submitPassword).not.toHaveBeenCalled();
    expect(screen.getByTestId("signin-error").textContent).toContain(
      "Enter your email or your Login ID, and your password.",
    );
  });

  it("hides Forgot password when the config turns it off", () => {
    renderPage(undefined, { ...CONFIG, forgotPassword: false });
    expect(screen.queryByTestId("signin-forgot")).toBeNull();
  });

  it("confirms a password reset", () => {
    renderPage({ step: "password", notice: "password_reset" });
    expect(screen.getByTestId("signin-notice").textContent).toContain(
      "Your password is changed. Sign in with the new one.",
    );
  });
});

describe("branding", () => {
  it("shows the org, the app, the org slug and the Ajna mark that branding cannot change", () => {
    renderPage();
    expect(screen.getByTestId("signin-org").textContent).toBe(
      "Organisation: Acme",
    );
    expect(screen.getByText("Plant Manager")).toBeTruthy();
    expect(screen.getByTestId("signin-secured").textContent).toContain(
      "Secured by Ajna · acme",
    );
  });

  it("shows a logo only from an https URL, with the org name as its text", () => {
    renderPage(undefined, {
      ...CONFIG,
      branding: {
        ...CONFIG.branding,
        logoUrl: "https://static.example.test/a.png",
      },
    });
    expect(screen.getByRole("img", { name: "Acme" }).getAttribute("src")).toBe(
      "https://static.example.test/a.png",
    );
  });

  it("renders a display name as text, never as HTML", () => {
    renderPage(undefined, {
      ...CONFIG,
      branding: { ...CONFIG.branding, displayName: "<b>Evil</b>" },
    });
    expect(screen.getByTestId("signin-org").textContent).toBe(
      "Organisation: <b>Evil</b>",
    );
    expect(document.querySelector("b")).toBeNull();
  });
});

describe("TOTP step", () => {
  it("asks for the six-digit code and sends it", async () => {
    const { user, machine } = renderPage({ step: "totp" });
    const field = screen.getByTestId("signin-totp");
    const first = field.querySelector("input")!;
    await user.click(first);
    await user.keyboard("123456");
    await user.click(screen.getByTestId("signin-submit"));
    expect(machine.submitTotp).toHaveBeenCalledWith("123456");
  });
});

describe("MFA setup", () => {
  it("shows a QR code and the secret as text", () => {
    renderPage({
      step: "mfa_setup",
      otpauthUri: "otpauth://totp/Acme:r?secret=JBSWY3DPEHPK3PXP&issuer=Acme",
      secret: "JBSWY3DPEHPK3PXP",
    });
    expect(
      screen.getByTestId("signin-mfa-qr").querySelector("svg"),
    ).not.toBeNull();
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeTruthy();
  });
});

describe("first sign-in (new password)", () => {
  it("refuses two different passwords without calling the machine", async () => {
    const { user, machine } = renderPage({ step: "new_password" });
    await user.type(
      screen.getByTestId("signin-new-password"),
      "A-Strong-Pass-1",
    );
    await user.type(
      screen.getByTestId("signin-new-password-again"),
      "A-Strong-Pass-2",
    );
    await user.click(screen.getByTestId("signin-submit"));
    expect(machine.submitNewPassword).not.toHaveBeenCalled();
    expect(screen.getByTestId("signin-error").textContent).toContain(
      "The two passwords are not the same.",
    );
  });

  it("shows the pool's password rules", () => {
    renderPage({ step: "new_password" });
    expect(screen.getByText(/at least 8 characters/)).toBeTruthy();
  });
});

describe("forgot password", () => {
  it("asks for the email, then the code and the new password", async () => {
    const { user, machine, queue } = renderPage();
    await user.click(screen.getByTestId("signin-forgot"));
    queue({ state: { step: "forgot_code" } });
    await user.type(screen.getByTestId("signin-email"), "ravi@example.com");
    await user.click(screen.getByTestId("signin-submit"));
    expect(machine.startForgot).toHaveBeenCalledWith("ravi@example.com");
    expect(
      await screen.findByText(/If the account exists, we sent a code/),
    ).toBeTruthy();
  });
});

describe("not a member of this org", () => {
  it("lists the person's own orgs as links to their doors", () => {
    renderPage({
      step: "not_member",
      orgs: [
        {
          slug: "beta",
          display_name: "Beta",
          door: "https://beta.example.test/",
        },
      ],
    });
    expect(screen.getByText(/You are not a member of Acme/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Beta" }).getAttribute("href"),
    ).toBe("https://beta.example.test/");
  });
});

describe("done", () => {
  it("hands the next address to the host once", async () => {
    const { user, queue, onDone } = renderPage();
    queue({
      state: { step: "done", next: "/v1/oidc/authorize/continue?request=r1" },
    });
    await user.type(screen.getByTestId("signin-email"), "ravi@example.com");
    await user.type(screen.getByTestId("signin-password"), "Correct-Horse-9");
    await user.click(screen.getByTestId("signin-submit"));
    await waitFor(() =>
      expect(onDone).toHaveBeenCalledWith(
        "/v1/oidc/authorize/continue?request=r1",
      ),
    );
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe("secrets never reach the page or the console", () => {
  it("does not log the password", async () => {
    const logs = vi.spyOn(console, "log");
    const errors = vi.spyOn(console, "error");
    const { user } = renderPage();
    await user.type(screen.getByTestId("signin-email"), "ravi@example.com");
    await user.type(screen.getByTestId("signin-password"), "Correct-Horse-9");
    await user.click(screen.getByTestId("signin-submit"));
    const all = [...logs.mock.calls, ...errors.mock.calls]
      .flat()
      .map(String)
      .join(" ");
    expect(all).not.toContain("Correct-Horse-9");
  });
});

describe("review fixes (plant-ea, ui#1)", () => {
  it("M5: labels the name as the organisation's name", () => {
    renderPage();
    expect(screen.getByTestId("signin-org").textContent).toBe(
      "Organisation: Acme",
    );
  });

  it("LOW: loads the logo without a referrer", () => {
    renderPage(undefined, {
      ...CONFIG,
      branding: {
        ...CONFIG.branding,
        logoUrl: "https://static.example.test/a.png",
      },
    });
    expect(
      screen.getByRole("img", { name: "Acme" }).getAttribute("referrerpolicy"),
    ).toBe("no-referrer");
  });
});

describe("notice (spec J2: ?reason=idle | signed_out)", () => {
  function renderWithNotice(
    notice: "idle" | "signed_out" | null,
    initial?: SignInState,
  ) {
    const fake = fakeMachine(initial);
    render(
      <SignInPage
        config={CONFIG}
        machine={fake.machine}
        onDone={vi.fn()}
        notice={notice}
      />,
    );
  }

  it("explains an idle sign-out", () => {
    renderWithNotice("idle");
    expect(screen.getByTestId("signin-notice").textContent).toContain(
      "You were signed out because you were inactive. Sign in again to continue.",
    );
  });

  it("confirms a sign-out", () => {
    renderWithNotice("signed_out");
    expect(screen.getByTestId("signin-notice").textContent).toContain(
      "You are signed out.",
    );
  });

  it("shows no notice without a reason", () => {
    renderWithNotice(null);
    expect(screen.queryByTestId("signin-notice")).toBeNull();
  });

  it("shows the notice on the password step only", () => {
    renderWithNotice("idle", { step: "totp" });
    expect(screen.queryByTestId("signin-notice")).toBeNull();
  });
});

describe("noticeFromReason", () => {
  it.each([
    ["idle", "idle"],
    ["signed_out", "signed_out"],
    ["IDLE", null],
    ["<script>", null],
    ["", null],
    [null, null],
  ] as const)("maps %j to %j by literal match only", (reason, expected) => {
    expect(noticeFromReason(reason)).toBe(expected);
  });
});
