# Ajna working conventions

## Code and structure

- Use clean, extensionless `@/` imports without `/index` for cross-folder imports within library source and docs; it resolves independently in each package. Keep colocated imports, public export barrels, and helpers outside `src/` relative. Consumer examples always use built-package imports.
- Keep comments limited to non-obvious decisions, necessary API documentation, and type directives. Do not narrate the code.
- The library uses Tailwind v3.4; docs use Tailwind v4. Keep their styles and builds separate.
- Author component styles as Tailwind utilities beside each component, without a central component stylesheet or `@apply` rules.
- Use `packages/react/src/components/<name>/` with `<name>.tsx` and `index.ts`. Colocate useful tests with their source. Add feature directories when the features are implemented.

## Styling and themes

- Support standalone compiled CSS and a shared preset for applications using Tailwind v3.4.
- Public variables use `--ajna-*`; theme utilities use names such as `bg-ajna-primary`. Standalone utilities must be scoped to Ajna elements. Never emit document-wide resets.
- Edit `packages/react/src/styles/theme.json`, not generated `dist` files. Color values contain HSL channels.

## Components

- Regenerate `packages/react/src/primitives/` and its package exports with `pnpm codegen:primitives` after Base UI updates. Primitive re-exports and `index.ts` are generated; preserve their colocated handwritten tests.
- Keep visible keyboard focus, accessible labels, reduced-motion behavior, and Base UI interaction semantics.
- Styled components include Button, Dialog, and the form component milestone: Field, Input, Textarea, Checkbox, and Switch. Additional styled families are Radio Group (including RadioGroupItem in one entry point), Input Group, Button Group, Separator, Badge, Banner, Skeleton, Collapsible, Accordion, Label, Spinner, Tooltip, Popover, Dropdown Menu, Avatar, Progress, Slider, Empty, Breadcrumbs, Card, Kbd, Toggle, Toggle Group, Tabs, Table, Toast, Number Input, Search Input, Password Input, Copy Button, Action Bar, and Drawer. Complete each component and its docs before moving to the next. Avoid introducing additional public components solely to implement internal details.
- Use named Lucide imports for built-in icons; Lucide is a regular dependency, not a peer. Consumer icon slots accept React elements from any icon library. Reuse Spinner for loading controls and hide decorative indicators from assistive technology.

## Documentation

- Docs examples import the built package, not library source. Keep each preview example in `apps/docs/examples/<component>/` and include its TSX file in MDX with `<include>` instead of copying the source into a code fence.
- Component docs must teach practical composition with complete copyable examples, supported variants and states, accessibility, and each public part's purpose. Document only implemented controls and behavior.
- Keep docs crisp and focused on usage. Include only details that help someone choose, use, or understand the component. Leave out irrelevant details, implementation commentary, and filler.
- Use realistic examples with only the setup needed to demonstrate the component. Reuse existing docs components and layouts before adding custom styling.
- Fix underlying component defects rather than compensating for them in examples.
- Update affected installation, theming, API docs, and the package README when setup, configuration, exports, tokens, or public behavior changes. Label planned behavior explicitly.

## Tests and verification

- Add tests only when they protect meaningful behavior, public API compatibility, package integration, or a concrete regression. Avoid tests that repeat cosmetic CSS values, exercise demo handlers, or duplicate existing coverage. Do not add tests merely because a file changed.
- Keep verification proportional to the change. Run relevant existing checks; use visual inspection for appearance and motion. Distinguish checks actually run from tests only written.
- Run the relevant checks documented in README. Record actual tested browser versions; never infer old-browser support from current Playwright runs.

## Workflow and releases

- Discuss proposed conventions and test-cleanup scope before changing them.
- Do not publish packages or deploy the docs without an explicit request.
- While the library is unpublished, keep version `0.1.0` and do not add changesets or bump versions unless explicitly requested.
- Keep ESLint, Prettier, and TypeScript 5.9. Run `pnpm lint` without warnings, `pnpm format:check`, and the relevant checks before completing a change. Use `pnpm lint:fix` for import ordering and safe fixes; Prettier owns formatting and Tailwind class sorting, with separate v3/v4 contexts.
- Preserve side-effect import order and generated primitive exports. Public entry points are bundled; verify packed consumers resolve types with both Bundler and NodeNext settings. Do not introduce broad lint suppressions or dummy keyboard interactions to satisfy accessibility checks.
