/**
 * The ONE platform sign-in page (spec v1.1, section E), built from @ajnacloud/ui parts.
 *
 * It renders the machine's state and nothing else: every rule lives in the machine and the
 * backend. Branding can change the org name and logo only; "Secured by Ajna · <org>" is always
 * shown. The page never logs a password, a code or a token.
 */
import {
  AjnaLogo,
  Banner,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  PasswordInput,
  QrCode,
} from "@ajnacloud/ui";
import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

import { awsTransport } from "./cognito/aws-transport";
import { type AuthConfig, httpSessionClient } from "./http";
import { createSignIn, type FlowErrorCode, type SignInMachine, type SignInState } from "./machine";

export interface SignInPageProps {
  config: AuthConfig;
  /** Called once with the same-origin address to go to after a successful sign-in. */
  onDone: (next: string) => void;
  /** For tests and hosts that build their own machine; by default one is built from config. */
  machine?: SignInMachine;
}

type FormErrorCode = FlowErrorCode | "empty" | "passwords_differ";

const MESSAGES: Readonly<Record<FormErrorCode, string>> = {
  invalid_credentials: "The email, Login ID or password is not correct.",
  SIGN_IN_BLOCKED:
    "This sign-in was blocked to protect your account. Reset your password, or contact your administrator.",
  password_reset_required: "You must set a new password first. Use Forgot password.",
  code_mismatch: "That code is not correct. Try again.",
  code_expired: "That code has expired. Ask for a new one.",
  password_policy: "The new password does not meet the rules below.",
  rate_limited: "Too many attempts. Wait a few minutes, then try again.",
  session_expired: "Your sign-in took too long. Start again.",
  unavailable: "Sign-in is not available right now. Try again in a few minutes.",
  login_id_invalid: "Enter your email or your Login ID.",
  login_id_needs_org: "Open your organisation's address to sign in with a Login ID.",
  MEMBERSHIP_SUSPENDED: "Your access to this organisation is suspended. Contact your administrator.",
  not_org_member: "You are not a member of this organisation.",
  token_invalid: "Sign-in could not be completed. Start again.",
  token_expired: "Sign-in could not be completed. Start again.",
  auth_time_stale: "Sign-in could not be completed. Start again.",
  invalid_request: "Sign-in could not be completed. Start again.",
  empty: "Enter your email or your Login ID, and your password.",
  passwords_differ: "The two passwords are not the same.",
};

interface CollectorWindow {
  AmazonCognitoAdvancedSecurityData?: { getData(username: string, poolId: string, clientId: string): string };
}

function defaultMachine(config: AuthConfig): SignInMachine {
  return createSignIn({
    config: {
      poolId: config.poolId,
      clientId: config.clientId,
      orgSlug: config.orgSlug,
      issuer: config.branding.displayName,
    },
    transport: awsTransport(config.region),
    session: httpSessionClient(),
    // The collector script is loaded by the host page only when config.collectorUrl is set (S1).
    userContextData: config.collectorUrl
      ? (username) =>
          (globalThis as CollectorWindow).AmazonCognitoAdvancedSecurityData?.getData(
            username,
            config.poolId,
            config.clientId,
          )
      : undefined,
  });
}

function policyText(p: AuthConfig["passwordPolicy"]): string {
  const parts = [`at least ${p.minLength} characters`];
  if (p.requireUpper) parts.push("an upper-case letter");
  if (p.requireLower) parts.push("a lower-case letter");
  if (p.requireDigit) parts.push("a number");
  if (p.requireSymbol) parts.push("a symbol");
  return `Use ${parts.join(", ")}.`;
}

function field(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? "");
}

function Code({ id, label }: { id: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputOTP id={id} name="code" length={6} data-testid="signin-totp" autoComplete="one-time-code">
        <InputOTPGroup>
          <InputOTPSlot aria-label="Digit 1" />
          <InputOTPSlot aria-label="Digit 2" />
          <InputOTPSlot aria-label="Digit 3" />
          <InputOTPSlot aria-label="Digit 4" />
          <InputOTPSlot aria-label="Digit 5" />
          <InputOTPSlot aria-label="Digit 6" />
        </InputOTPGroup>
      </InputOTP>
    </Field>
  );
}

export function SignInPage({ config, onDone, machine: given }: SignInPageProps) {
  const id = useId();
  const machine = useMemo(() => given ?? defaultMachine(config), [given, config]);
  const [state, setState] = useState<SignInState>(machine.state);
  const [error, setError] = useState<FormErrorCode | undefined>();
  const [pending, setPending] = useState(false);
  const [askingForgot, setAskingForgot] = useState(false);
  const doneSent = useRef(false);

  useEffect(() => {
    if (state.step === "done" && !doneSent.current) {
      doneSent.current = true;
      onDone(state.next);
    }
  }, [state, onDone]);

  async function run(step: () => Promise<{ state: SignInState; error?: FlowErrorCode }>) {
    if (pending) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await step();
      setState(result.state);
      setError(result.error);
      if (result.state.step !== "password") setAskingForgot(false);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (askingForgot && state.step === "password") {
      const loginId = field(form, "username").trim();
      if (!loginId) return setError("login_id_invalid");
      void run(() => machine.startForgot(loginId));
      return;
    }
    switch (state.step) {
      case "password": {
        const loginId = field(form, "username").trim();
        const password = field(form, "password");
        if (!loginId || !password) return setError("empty");
        void run(() => machine.submitPassword(loginId, password));
        return;
      }
      case "totp":
        void run(() => machine.submitTotp(field(form, "code")));
        return;
      case "mfa_setup":
        void run(() => machine.submitMfaSetupCode(field(form, "code")));
        return;
      case "new_password": {
        const first = field(form, "new_password");
        if (first !== field(form, "new_password_again")) return setError("passwords_differ");
        void run(() => machine.submitNewPassword(first));
        return;
      }
      case "forgot_code": {
        const first = field(form, "new_password");
        if (first !== field(form, "new_password_again")) return setError("passwords_differ");
        void run(() => machine.confirmForgot(field(form, "code"), first));
        return;
      }
      default:
        return;
    }
  }

  function backToPassword() {
    setAskingForgot(false);
    setError(undefined);
    setState(machine.backToPassword().state);
  }

  const brand = config.branding;
  let title = "Sign in";
  let body: ReactNode = null;
  let submitLabel = "Sign in";

  if (state.step === "password" && askingForgot) {
    title = "Reset your password";
    submitLabel = "Send a code";
    body = (
      <Field>
        <FieldLabel htmlFor={`${id}-user`} required>
          Email or Login ID
        </FieldLabel>
        <Input id={`${id}-user`} name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} data-testid="signin-email" disabled={pending} />
      </Field>
    );
  } else if (state.step === "password") {
    body = (
      <>
        {state.notice === "password_reset" && (
          <Banner variant="success" data-testid="signin-notice" title="Your password is changed. Sign in with the new one." />
        )}
        <Field>
          <FieldLabel htmlFor={`${id}-user`} required>
            Email or Login ID
          </FieldLabel>
          <Input id={`${id}-user`} name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} data-testid="signin-email" disabled={pending} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-password`} required>
            Password
          </FieldLabel>
          <PasswordInput id={`${id}-password`} name="password" autoComplete="current-password" data-testid="signin-password" disabled={pending} />
        </Field>
      </>
    );
  } else if (state.step === "totp") {
    title = "Enter your code";
    submitLabel = "Continue";
    body = <Code id={`${id}-code`} label="The 6-digit code from your authenticator app" />;
  } else if (state.step === "mfa_setup") {
    title = "Set up two-step sign-in";
    submitLabel = "Turn on";
    body = (
      <>
        <p className="text-sm text-ajna-muted-foreground">
          Scan this code with an authenticator app, then enter the 6-digit code it shows.
        </p>
        <div data-testid="signin-mfa-qr" className="flex justify-center">
          <QrCode.Root value={state.otpauthUri} size="lg">
            <QrCode.Frame aria-label="Authenticator set-up code" className="bg-white text-black" />
          </QrCode.Root>
        </div>
        <Field>
          <FieldLabel htmlFor={`${id}-secret`}>Or enter this key by hand</FieldLabel>
          <code id={`${id}-secret`} className="block break-all rounded-md bg-ajna-muted p-2 text-sm">
            {state.secret}
          </code>
        </Field>
        <Code id={`${id}-code`} label="The 6-digit code from your authenticator app" />
      </>
    );
  } else if (state.step === "new_password" || state.step === "forgot_code") {
    title = state.step === "new_password" ? "Choose your password" : "Set a new password";
    submitLabel = "Save password";
    body = (
      <>
        {state.step === "forgot_code" && (
          <>
            <p className="text-sm text-ajna-muted-foreground">
              If the account exists, we sent a code to its email. Enter it below.
            </p>
            <Code id={`${id}-code`} label="The 6-digit code from the email" />
          </>
        )}
        <Field>
          <FieldLabel htmlFor={`${id}-new`} required>
            New password
          </FieldLabel>
          <PasswordInput id={`${id}-new`} name="new_password" autoComplete="new-password" data-testid="signin-new-password" disabled={pending} />
          <FieldDescription>{policyText(config.passwordPolicy)}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-again`} required>
            Type it again
          </FieldLabel>
          <PasswordInput id={`${id}-again`} name="new_password_again" autoComplete="new-password" data-testid="signin-new-password-again" disabled={pending} />
        </Field>
      </>
    );
  } else if (state.step === "not_member") {
    title = "No access here";
    body = (
      <div className="space-y-3 text-sm">
        <p>
          You are not a member of {brand.displayName}. Ask an admin of {brand.displayName} to invite you.
        </p>
        {state.orgs.length > 0 && (
          <>
            <p>Your organisations:</p>
            <ul className="space-y-1">
              {state.orgs.map((org) => (
                <li key={org.slug}>
                  <a className="underline" href={org.door}>
                    {org.display_name || org.slug}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  } else if (state.step === "done") {
    title = "Signing you in…";
  }

  const showForm = state.step !== "not_member" && state.step !== "done";
  const showBack = state.step !== "password" || askingForgot;

  return (
    <main className="grid min-h-dvh place-items-center bg-ajna-background px-4 py-10 text-ajna-foreground">
      <section className="w-full max-w-sm" aria-labelledby={`${id}-title`}>
        <header className="mb-8 flex items-center gap-3">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.displayName} className="size-8 object-contain" />
          ) : (
            <AjnaLogo variant="glyph" color="current" width={32} />
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{brand.displayName}</p>
            {brand.appDisplayName && <p className="text-xs text-ajna-muted-foreground">{brand.appDisplayName}</p>}
          </div>
        </header>
        <h1 id={`${id}-title`} className="mb-6 text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {showForm ? (
          <form className="space-y-5" aria-busy={pending} noValidate onSubmit={onSubmit}>
            {error && (
              <FieldError role="alert" data-testid="signin-error">
                {MESSAGES[error]}
              </FieldError>
            )}
            {body}
            <Button type="submit" variant="primary" loading={pending} className="h-11 w-full" data-testid="signin-submit">
              {submitLabel}
            </Button>
            <div className="flex justify-between text-sm">
              {showBack ? (
                <Button type="button" variant="ghost" onClick={backToPassword}>
                  Back to sign-in
                </Button>
              ) : (
                <span />
              )}
              {state.step === "password" && !askingForgot && config.forgotPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  data-testid="signin-forgot"
                  onClick={() => {
                    setError(undefined);
                    setAskingForgot(true);
                  }}
                >
                  Forgot password?
                </Button>
              )}
            </div>
          </form>
        ) : (
          body
        )}
        <footer className="mt-8 border-t border-ajna-border pt-4 text-xs text-ajna-muted-foreground" data-testid="signin-secured">
          Secured by Ajna{config.orgSlug ? ` · ${config.orgSlug}` : ""}
        </footer>
      </section>
    </main>
  );
}
