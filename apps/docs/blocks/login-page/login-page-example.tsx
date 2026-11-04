"use client";

import { Button } from "@ajnacloud/ui";
import { useState } from "react";

import { LoginPage } from "./login-page";

export function LoginPageExample() {
  const [signedIn, setSignedIn] = useState(false);
  return signedIn ? (
    <main className="flex min-h-dvh items-center justify-center bg-ajna-background p-6 text-ajna-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Signed in</h1>
        <p role="status" className="text-sm text-ajna-muted-foreground">
          Your workspace is ready.
        </p>
        <Button variant="secondary" onClick={() => setSignedIn(false)}>
          Back to sign in
        </Button>
      </div>
    </main>
  ) : (
    <LoginPage
      organization="Greenhouse"
      application="Inventory and operations"
      onSignIn={() => setSignedIn(true)}
    />
  );
}
