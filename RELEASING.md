# Releasing `@ajnacloud/ui`

The merge is the release. `.github/workflows/release.yml` runs on every push to `main`:

1. It reads `packages/react/package.json`'s `version`. If that version is already on npm, it stops: there is nothing to release.
2. A tag `v<version>` that exists without the npm version stops the run, because that version was tagged by hand. Bump the version instead.
3. It runs the same checks as `ci.yml`, then `pnpm pack`.
4. It runs the public-content guard on the exact `.tgz` (`scripts/check-packed-content.mjs`).
5. `npm publish <that .tgz> --provenance` through npm trusted publishing (GitHub OIDC). No npm token is stored anywhere.
6. It creates the tag `v<version>` on the merge commit and a GitHub release with the same `.tgz`. A version with a `-` is a pre-release.

To release: bump `version` in `packages/react/package.json` in a pull request, then merge it.

Consumers pin an exact version in `package.json` and the lockfile.

## One-time owner step

On npmjs.com: `@ajnacloud/ui` → Settings → Trusted Publisher → GitHub Actions. Set the organisation `ajnacloud-ksj`, the repository `ui` and the workflow file `release.yml`. Then turn off token publishing for the package.

## 0.1.0-beta.12

`0.1.0-beta.12` is a GitHub-only pre-release (tag `v0.1.0-beta.12`, the `.tgz` on the release page). It is never on npm, and the workflow refuses to publish it, because its tag exists. `0.1.0-beta.13` has the same package content and is the first version that the workflow publishes.
