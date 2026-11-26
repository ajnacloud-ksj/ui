import { Button } from "@ajnacloud/ui/button";
import { type ReactNode, useEffect, useState } from "react";

import { beginBffLogin, currentPath, signInDecision } from "./bff-signin";
import { useSessionUser } from "./session-provider";
import { isLeaving } from "./session-store";

/**
 * Shown in place of the app when nobody is signed in. Normally it shows only a quiet
 * "Signing in…" while the page leaves for the BFF sign-in (`/api/v1/auth/oidc/start`): there is
 * no sign-in page. Only when the loop guard holds (a callback error, an account the backend
 * could not load, a sign-in that came back without a session) does it say why, with one
 * "Try again".
 *
 * The decision is read once, at mount: starting the sign-in sets the loop guard's mark, and a
 * second read would show the guard's message while the page is still leaving.
 */
export function SignInGate() {
  const [decision] = useState(() => signInDecision(isLeaving()));

  useEffect(() => {
    if (decision.kind === "door") {
      window.location.replace(decision.url);
      return;
    }
    if (decision.kind !== "start") return;
    try {
      beginBffLogin({ returnTo: currentPath(), auto: true });
    } catch (err) {
      // Not reached: a page that cannot start the sign-in is "unavailable", decided above.
      console.error("Sign-in could not start:", err);
    }
  }, [decision]);

  const message = "message" in decision ? decision.message : "";
  if (!message) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-background text-muted-foreground flex min-h-svh items-center justify-center text-sm"
      >
        {decision.kind === "leaving" ? "Signing out…" : "Signing in…"}
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center px-4">
      <div role="alert" className="w-full max-w-sm space-y-4 text-center">
        <p className="text-foreground text-sm">{message}</p>
        {decision.kind === "stopped" && (
          <Button
            onClick={() =>
              decision.retry === "reload"
                ? window.location.reload()
                : beginBffLogin({ returnTo: currentPath() })
            }
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}

/** The route guard: the children when someone is signed in, else the SignInGate. */
export function RequireSession({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  return user ? <>{children}</> : <SignInGate />;
}
