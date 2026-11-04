"use client";

import {
  AjnaLogo,
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
} from "@ajnacloud/ui";
import { ArrowRight } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";

export interface LoginPageProps {
  organization: string;
  application?: string;
  logo?: ReactNode;
  artwork?: ReactNode;
  help?: ReactNode;
  onSignIn: (credentials: {
    username: string;
    password: string;
  }) => void | Promise<void>;
}

export function LoginPage({
  organization,
  application = "Workspace",
  logo,
  artwork,
  help,
  onSignIn,
}: LoginPageProps) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  return (
    <main className="grid min-h-dvh bg-ajna-background text-ajna-foreground md:grid-cols-2">
      <section
        className="flex min-w-0 flex-col gap-10 px-6 py-8 sm:px-12 lg:px-16"
        aria-labelledby={`${id}-title`}
      >
        <header className="flex items-center gap-3">
          {logo ?? <AjnaLogo variant="glyph" color="current" width={32} />}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{organization}</p>
            <p className="mt-0.5 text-xs text-ajna-muted-foreground">
              {application}
            </p>
          </div>
        </header>
        <div className="mx-auto my-auto w-full max-w-sm py-8">
          <h1
            id={`${id}-title`}
            className="text-3xl font-semibold tracking-tight"
          >
            Welcome back.
          </h1>
          <p className="mt-3 mb-8 text-sm leading-6 text-ajna-muted-foreground">
            Sign in to your workspace to continue.
          </p>
          <form
            className="space-y-5"
            aria-busy={pending}
            onSubmit={(event) => {
              event.preventDefault();
              if (inFlight.current) return;
              const data = new FormData(event.currentTarget);
              const username = String(data.get("username") ?? "").trim();
              const password = String(data.get("password") ?? "");
              if (!username || !password) {
                setError("Enter your username and password.");
                return;
              }
              inFlight.current = true;
              setPending(true);
              setError("");
              void Promise.resolve()
                .then(() => onSignIn({ username, password }))
                .catch((cause: unknown) =>
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : "Sign-in failed. Try again.",
                  ),
                )
                .finally(() => {
                  inFlight.current = false;
                  setPending(false);
                });
            }}
          >
            {error && <FieldError role="alert">{error}</FieldError>}
            <Field>
              <FieldLabel htmlFor={`${id}-username`} required>
                Username or email
              </FieldLabel>
              <Input
                id={`${id}-username`}
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@company.com"
                className="h-11"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-password`} required>
                Password
              </FieldLabel>
              <PasswordInput
                id={`${id}-password`}
                name="password"
                autoComplete="current-password"
                required
                disabled={pending}
                placeholder="Enter your password"
                className="h-11"
              />
            </Field>
            <Button
              type="submit"
              variant="primary"
              loading={pending}
              className="h-11 w-full"
            >
              Sign in
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </form>
          <div className="mt-7 border-t border-ajna-border pt-5 text-xs leading-6 text-ajna-muted-foreground">
            {help ?? "Need access? Contact your workspace administrator."}
          </div>
        </div>
      </section>
      <aside
        className="relative m-4 hidden min-h-0 overflow-hidden rounded-2xl bg-ajna-brand-navy text-ajna-brand-light-blue md:flex"
        aria-label="Workspace artwork"
      >
        {artwork ?? (
          <div className="flex w-full flex-col justify-between p-10 lg:p-14">
            <span className="text-xs font-medium tracking-widest text-ajna-brand-blue uppercase">
              Ajna workspace
            </span>
            <AjnaLogo
              variant="glyph"
              color="current"
              className="mx-auto w-2/3 max-w-sm opacity-80"
            />
            <div>
              <p className="max-w-xs text-3xl leading-tight font-medium tracking-tight">
                {organization}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-ajna-brand-light-blue">
                {application}
              </p>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
