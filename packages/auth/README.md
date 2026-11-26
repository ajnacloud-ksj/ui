# @ajnacloud/auth

The Ajna platform sign-in: Secure Remote Password (SRP) against Amazon Cognito, run in the browser, and the sign-in screens, built from `@ajnacloud/ui`.

> **Internal to the platform.** The platform sign-in pages use this package: the portal and the cockpit. **Apps never import it**; apps send a signed-out user to the platform sign-in. The package is private until a publish is requested.

## What it does

- **The password never leaves the browser.** Only SRP values go to Cognito (`USER_SRP_AUTH`), and nothing goes to our backend except the final tokens. They are handed over once to `POST /v1/auth/session`, which sets HttpOnly cookies, and are never stored in `localStorage` or `sessionStorage`.
- **Every sign-in step is on our page:** password, the authenticator code (TOTP), MFA setup with a QR code, the first sign-in from an invite (new password), forgot password, a blocked sign-in (`SIGN_IN_BLOCKED`), and "not a member of this organisation".
- **No-email accounts** sign in with a Login ID. On the org's page the person types only the handle, and the page adds `.<org>@users.invalid`.
- **The configuration comes at run time** from `GET /v1/auth/config` and is validated. The source holds no pool id, client id, endpoint or secret.

## Use (platform sign-in pages only)

```tsx
import { fetchAuthConfig, SignInPage } from "@ajnacloud/auth";

const config = await fetchAuthConfig();
<SignInPage config={config} onDone={(next) => window.location.assign(next)} />;
```

The host app must:

- add `node_modules/@ajnacloud/auth/dist/**/*.js` to Tailwind `content`, next to `@ajnacloud/ui`;
- allow `https://cognito-idp.<region>.amazonaws.com` in the CSP `connect-src`;
- load the Cognito advanced-security collector only when `config.collectorUrl` is set.

## Tests

- `pnpm --filter @ajnacloud/auth test`: unit and component tests.
  - The SRP maths is checked byte for byte against `amazon-cognito-identity-js` (a test-only dev dependency) and against an independent SRP server.
  - The state machine runs against `src/testing/fake-cognito.ts`, an in-memory pool that checks the SRP signature.
- `pnpm --filter @ajnacloud/auth test:package`: packs the package and runs publint and attw. It fails if a test file, the fake pool or the reference library would ship.
