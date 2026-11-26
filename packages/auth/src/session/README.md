# @ajnacloud/auth/session

The app's complete sign-in and session. The app imports it only from
`@ajnacloud/auth/session`, and calls `configureAppSession()` once at start-up.

> Follow-up: this folder moves into a tiny shared package in the
> ajnacloud-ksj/ui repo (proposed `@ajnacloud/app-session`) so apps stop
> copying it; until then, do not edit it per app.

## What the module does

Sign-in is a platform feature. The app has no sign-in page, no MFA or
new-password screen, no browser PKCE, no Cognito hosted login, no portal code
hand-off and no token in browser storage. People sign in only at the platform
portal. They arrive through the app backend (BFF, backend-for-frontend):

1. **Boot** (`bootSession`, called in `src/main.tsx` before React mounts). It
   deletes the keys that older bundles kept tokens in (`purgeBrowserTokens`).
   Then it asks `GET /api/v1/auth/me` who is signed in. A 401 gets one
   `POST /api/v1/auth/oidc/refresh` and one more `/auth/me`. A 5xx or no
   answer gets one retry after 800 ms. The user is kept in memory only
   (`session-store.ts`).
2. **Signed out** (`RequireSession` and `SignInGate`). The page goes
   immediately to `GET /api/v1/auth/oidc/start?return=<this path>`
   (`beginBffLogin`). There is no landing page and no button.
3. **Loop guard.** The page does not start the sign-in again by itself in these
   cases:
   - the URL has a `?auth_error` from the callback;
   - `/auth/me` answered 403 (the app cannot load the account);
   - the backend did not answer (5xx or network) after one retry;
   - this tab started a sign-in less than 10 minutes ago and came back with no
     session;
   - this tab made 2 automatic starts in 10 minutes (a good `/auth/me` does not
     reset this count).

   In these cases the gate shows one line of text and one "Try again" button.

4. **API calls** (`installSessionInterceptors(axiosInstance)`). Each call to the
   app's own origin sends the cookies and `X-Ajna-Session: cookie`. A write
   also sends `X-Ajna-CSRF`. A 401 gets one refresh and a replay. If the
   backend refuses the refresh, or the replay gets a 401 again, the page starts the BFF
   sign-in (the loop guard applies). If the refresh cannot reach the backend,
   only that call fails.
5. **Sign-out** (`signOut`, `useAppSession().logout`, and the idle timeout).
   First the `onSignOut` cleanups run (for example, the query cache). Then
   `POST /api/v1/auth/logout` runs (the wait is 3 s at most). Then the page
   goes to the portal (`portalSignOutUrl`). The sign-out writes
   `ajna_signed_out_at` (a time, not a token) to localStorage. Every other open
   tab of the app then signs out too (`watchSignOutInOtherTabs`). For 30 s
   after a sign-out, a 401 starts no sign-in.
6. **Idle timeout** (`idle-timeout.ts`). `AppSessionProvider` starts it with
   the `idleMinutes` value that the app supplies (from the tenant config). A
   refresh never revives an idle-expired session.

## Contract with the SDK routes

The API base ends at `/v1` (`VITE_API_URL`, reduced to the same-origin path
`/api/v1` on every app host by `api-base.ts`). The session cookies are
host-only, so every route must be same-origin with the page.

| Route                          | Method | Use                                                                                                |
| ------------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| `/v1/auth/oidc/start?return=…` | GET    | Top-level navigation. The backend makes state, nonce and PKCE, and sends the browser on.           |
| `/v1/auth/oidc/callback`       | GET    | The backend redeems the code, sets the cookies and redirects to `return`. The page never calls it. |
| `/v1/auth/oidc/refresh`        | POST   | Rotates the cookie session. 2xx: refreshed. 4xx: the session is over. 5xx: try later.              |
| `/v1/auth/me`                  | GET    | The signed-in user: `user_id`, `username`, `email`, `role`, `tenant_id` (an envelope is accepted). |
| `/v1/auth/logout`              | POST   | Clears the session cookies on this browser only.                                                   |
| `/v1/auth/config`              | GET    | Public. The module never refreshes on a 401 from it.                                               |

Headers and cookies:

- Every call to the app's own API sends `X-Ajna-Session: cookie`.
- A write (any method except GET, HEAD and OPTIONS) also sends `X-Ajna-CSRF`
  with the value of the readable `__Host-ajna_csrf` cookie (double submit).
  Without it, the backend answers 403.
- `/auth/me` and `/auth/oidc/refresh` send `X-Tenant-ID` on a tenant door, so
  the SDK picks the role for that organisation.
- The page never sends `Authorization`.
- A failed callback returns to `/?auth_error=<code>`. The codes are
  `login_required`, `denied`, `flow`, `state`, `exchange`, `id_token`,
  `request`, `provider` and `unavailable`. Each has a fixed message, and the
  page shows nothing from the URL.

## Public API (`index.ts`)

| Export                                                                                                                    | Kind                  |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `bootSession`, `beginBffLogin`, `refreshBffSession`, `signOutBffSession`, `purgeBrowserTokens`                            | sign-in functions     |
| `bffStartUrl`, `currentPath`, `isSafeReturnPath`, `isBareAppHost`, `signInDecision`, `lastBootResult`, `AUTH_ERROR_PARAM` | sign-in helpers       |
| `signOut`, `onSignOut`, `watchSignOutInOtherTabs`                                                                         | sign-out              |
| `sessionUser`, `onSessionUser`, `isLeaving`, `IAppSessionUser`                                                            | in-memory store       |
| `useSessionUser`, `useAppSession`, `AppSessionProvider`                                                                   | React hooks, provider |
| `RequireSession`, `SignInGate`                                                                                            | route guard           |
| `installSessionInterceptors`                                                                                              | axios 401 interceptor |
| `resolvePortalUrl`, `portalSignOutUrl`                                                                                    | portal URLs           |
| `parseIdleMinutes`, `readStoredIdleMinutes`, `storeIdleMinutes`, `IDLE_MINUTES_KEY`                                       | idle-limit storage    |

## Dependencies

The module imports only its own files, `react`, `axios` (an optional peer) and
`@ajnacloud/ui`. The platform host rules live here too: `tenant-host.ts` (the
tenant from the host) and `api-base.ts` (the same-origin API base). They are
exported, so an app's API client uses the same rules and keeps no copy. The
app's build settings come only from `configureAppSession()`.

## How an app uses it

```tsx
// src/main.tsx
await bootSession()

// src/lib/api.ts (before the app's own response interceptors)
installSessionInterceptors(api)

// src/app.tsx
<AppSessionProvider idleMinutes={idleMinutes}>…</AppSessionProvider>

// src/routes.tsx
<RequireSession><AppLayout /></RequireSession>

// any component
const { user, logout } = useAppSession()
```
