# @ajnacloud/ui

Accessible React components built with Base UI. Supports React 18.2+ and 19, with standalone CSS or a Tailwind v3.4 preset.

## Install

The beta release is being prepared and has not been published yet. Once available:

```bash
npm install @ajnacloud/ui@beta
```

Keep your application's existing compatible React and React DOM versions. Other package dependencies install automatically.

## Usage

The package provides ESM components and utilities, plus a CommonJS Tailwind preset.

For applications without Tailwind or using Tailwind v4, import the stylesheet once before your application styles:

```tsx
import "@ajnacloud/ui/styles.css";
import "./globals.css";
```

Import components from the package root or individual entry points:

```tsx
import { Button } from "@ajnacloud/ui";
// Or: import { Button } from "@ajnacloud/ui/button";

export function SaveButton() {
  return <Button type="submit">Save changes</Button>;
}
```

## Tailwind v3.4

Use the preset and scan the installed package in `tailwind.config.cjs`:

```js
const path = require("node:path");

module.exports = {
  presets: [require("@ajnacloud/ui/tailwind")],
  content: [
    "./index.html",
    "./{app,pages,components,src}/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(
      path.dirname(require.resolve("@ajnacloud/ui/tailwind")),
      "**/*.js",
    ),
  ],
};
```

Keep the normal Tailwind directives in your application stylesheet:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Primitives and utilities

Unstyled Base UI components are available through `@ajnacloud/ui/primitives` and individual paths such as `@ajnacloud/ui/primitives/select`.

Import `cn` from `@ajnacloud/ui/utils` to merge class names.

## License

[MIT](LICENSE).
