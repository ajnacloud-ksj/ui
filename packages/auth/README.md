# @ajnacloud/auth

The Ajna platform sign-in, the app session and the Members block, built from `@ajnacloud/ui`. One package and one version, with three subpath exports:

| Import                    | Who uses it                                                    | What it is                                                                                                                   |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `@ajnacloud/auth/signin`  | the platform sign-in host only (the portal; later the cockpit) | Secure Remote Password (SRP) against Amazon Cognito in the browser, and the sign-in screens                                  |
| `@ajnacloud/auth/session` | every app UI                                                   | the app's session: boot from the cookie session, the axios interceptor, refresh, sign-out, the idle timeout, the route guard |
| `@ajnacloud/auth/members` | an app's own user-management screen                            | `MembersBlock` and `membersApi()` for the app's `/v1/users` routes                                                           |

Consumers pin an **exact** version in `package.json` and the lockfile, so a new version never arrives silently.

## `./signin`

- **The password never leaves the browser.** Only SRP values go to Cognito (`USER_SRP_AUTH`). Nothing goes to our backend except the final tokens. They are handed over once to `POST /v1/auth/session`, which sets HttpOnly cookies. They are never stored in `localStorage` or `sessionStorage`.
- **Every sign-in step is on our page:** password, the authenticator code (TOTP), MFA setup with a QR code, the first sign-in from an invite (new password), forgot password, a blocked sign-in (`SIGN_IN_BLOCKED`), and "not a member of this organisation".
- **No-email accounts** sign in with a Login ID. On the org's page the person types only the handle, and the page adds `.<org>@users.invalid`.
- **The configuration comes at run time** from `GET /v1/auth/config` and is validated against build-time pins. The source holds no pool id, client id, endpoint or secret.

```tsx
import { fetchAuthConfig, SignInPage } from "@ajnacloud/auth/signin";

const config = await fetchAuthConfig({
  poolIds,
  logoHosts,
  doorZone,
  apiBase: "/api",
});
<SignInPage config={config} onDone={(next) => window.location.assign(next)} />;
```

The host must:

- add `node_modules/@ajnacloud/auth/dist/**/*.js` to Tailwind `content`, next to `@ajnacloud/ui`;
- allow `https://cognito-idp.<region>.amazonaws.com` in the CSP `connect-src`;
- load the Cognito advanced-security collector only when `config.collectorUrl` is set.

## `./session`

Call `configureAppSession()` once in the app's entry point, before it renders. A prebuilt package cannot read the app's `import.meta.env`, so the app passes its own values:

```ts
import { configureAppSession } from "@ajnacloud/auth/session";

configureAppSession({
  apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "",
  defaultTenant: import.meta.env.VITE_DEFAULT_TENANT,
  portalOrgHost: import.meta.env.VITE_PORTAL_ORG_HOST,
  fallbackPortalHost: "portal.<your zone>",
});
```

The session throws if it is used before this call (a wiring fault, never a silent default). `axios` is an optional peer, needed only for `installSessionInterceptors`. See `src/session/README.md` for the flows.

## `./members`

`MembersBlock` lists, invites, changes roles, suspends, restores and removes an app's members. The platform membership service decides every rule; the block shows its answer. The error codes are exactly spec v1.6 section C's map (a test pins them).

## Tests

- `pnpm --filter @ajnacloud/auth test`: unit and component tests.
  - The SRP maths is checked byte for byte against `amazon-cognito-identity-js` (a test-only dev dependency) and against an independent SRP server.
  - The state machine runs against `src/testing/fake-cognito.ts`, an in-memory pool that checks the SRP signature.
- `pnpm --filter @ajnacloud/auth test:package`: packs the package and runs publint and attw. It fails if a test file, the fake pool or the reference library would ship.
