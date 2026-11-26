/**
 * Resolve the API base so a page always talks to the origin that served it.
 *
 * The deploy injects `VITE_API_URL` at BUILD time as an ABSOLUTE url pointing at the app's
 * apex host (e.g. `https://myapp.example.test/api/v1`). That is right when the app is opened
 * at the apex and wrong at every other host it answers to — above all a TENANT DOOR
 * (`https://acme.myapp.example.test`), the model this app is built around. From a door the
 * baked-in apex origin turns every call cross-origin, and auth calls go out in credentials
 * mode for the cookie refresh. The API is deliberately multi-tenant CORS —
 * `Access-Control-Allow-Origin: *` with no `Allow-Credentials` — and a browser rejects
 * wildcard-origin + credentials outright, so the preflight fails and login never leaves the
 * page:
 *
 *   Access to XMLHttpRequest at 'https://myapp.example.test/api/v1/items'
 *   from origin 'https://acme.myapp.example.test' has been blocked by CORS policy
 *
 * The app's CloudFront serves the API on EVERY alias it answers to, doors included, so the
 * injected origin is redundant whenever this page is already being served by that app.
 * Dropping it to a path makes each door talk to itself: same-origin, no preflight, and
 * cookies scoped to the host that set them.
 *
 * We drop the origin only when the current page is served by that same app: identical scheme
 * and port, and a hostname that either equals the injected one or is a subdomain of it (a
 * door). Everything else keeps the absolute url — an app whose API genuinely lives on a
 * retained `*api.` subdomain, or a frontend-only dev on `localhost:5173` talking to a backend
 * on `localhost:8000`, which shares a hostname but is a DIFFERENT origin. Comparing hostnames
 * alone would silently redirect that dev's calls into the vite server and 404 every one.
 *
 * Origin only — callers keep their own `/v1` convention on top of the result.
 */
export function resolveApiBase(
  injected: string | undefined,
  currentOrigin: string,
): string {
  const raw = (injected ?? "").trim();
  if (!raw) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw; // already relative — nothing to resolve

  let target: URL;
  let here: URL;
  try {
    target = new URL(raw);
    here = new URL(currentOrigin);
  } catch {
    return raw; // unparseable: leave exactly as configured rather than guessing
  }

  const hereHost = here.hostname.toLowerCase().replace(/\.$/, "");
  const targetHost = target.hostname.toLowerCase().replace(/\.$/, "");
  const servedBySameApp =
    here.protocol === target.protocol &&
    here.port === target.port &&
    (hereHost === targetHost || hereHost.endsWith(`.${targetHost}`));

  if (!servedBySameApp) return raw;

  return target.pathname.replace(/\/+$/, "");
}

/**
 * The app's versioned API base: `resolveApiBase` plus EXACTLY one trailing `/v1`, whether the
 * injected host already ends in `/v1` or not (no `/v1/v1`).
 */
export function appApiBase(injected: string, currentOrigin: string): string {
  const origin = resolveApiBase(injected, currentOrigin);
  return `${origin.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`;
}
