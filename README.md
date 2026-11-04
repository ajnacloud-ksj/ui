# Ajna

React components and application blocks.

## Workspace

- [`packages/react`](packages/react): `@ajnacloud/ui`, built with Base UI and Tailwind v3.4. Supports standalone CSS and a Tailwind preset.
- [`apps/docs`](apps/docs): Next.js and Fumadocs with Tailwind v4. Examples consume the built package.

For installation and usage, see the [package README](packages/react/README.md).

## Development

Use Node.js 22.18+ (22.x), 24.11+ (24.x), or 26+, and pnpm 10.17.1.

```bash
pnpm install
pnpm dev
```

This builds the library and starts the docs. After changing library source, run `pnpm build:library` to refresh the examples.

For continuous library updates, run `pnpm --filter @ajnacloud/ui dev` in another terminal. It rebuilds JavaScript, declarations, and styles with tsdown while the docs server runs.

Library build and watch commands use the tsdown CLI and share one configuration. They consume checked-in primitive exports without regenerating source files or updating the package manifest.

See [AGENTS.md](AGENTS.md) for working conventions.

## Checks

| Command              | Purpose                                 |
| -------------------- | --------------------------------------- |
| `pnpm lint`          | Lint without warnings                   |
| `pnpm format:check`  | Check formatting                        |
| `pnpm typecheck`     | Check library, docs, and consumer types |
| `pnpm test`          | Run unit and component tests            |
| `pnpm test:blocks`   | Run docs and block browser tests        |
| `pnpm test:package`  | Check packed package with publint/attw  |
| `pnpm codegen:check` | Check generated Base UI exports         |
| `pnpm build`         | Build the library and docs              |

Install browser engines before running browser tests:

```bash
pnpm exec playwright install chromium firefox webkit
```

The package check uses `publint` and `@arethetypeswrong/cli` on the packed tarball.

After updating Base UI, run `pnpm codegen:primitives` to regenerate its re-exports before building or packing. CI runs `pnpm codegen:check` to catch stale generated exports.

## Docs deployment

For Vercel, set the root directory to `apps/docs`, select Next.js, and enable **Include source files outside of the Root Directory in the Build Step**.

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: Next.js default

The docs build also builds the library.

## License

[MIT](LICENSE).
