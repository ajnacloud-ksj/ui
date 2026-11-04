import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import hooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/.source/**",
      "**/.cache/**",
      "**/coverage/**",
      "**/next-env.d.ts",
      "**/node_modules/**",
      "**/test-results/**",
      "**/playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^\\u0000"], ["^node:"], ["^@?\\w"], ["^@/"], ["^\\."]],
        },
      ],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { globals: { require: "readonly", module: "readonly" } },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": hooks },
    rules: hooks.configs.recommended.rules,
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ["**/*.{jsx,tsx}"],
  },
  {
    // Named scroll regions and disabled-control tooltip wrappers need keyboard focus.
    files: [
      "apps/docs/examples/table/table-sticky-example.tsx",
      "apps/docs/examples/tooltip/tooltip-disabled-action.tsx",
      "tests/consumer/app.tsx",
    ],
    rules: {
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { roles: ["region", "group"] },
      ],
    },
  },
  {
    // The search region delegates its shortcut to the focused input and button.
    files: ["apps/docs/examples/kbd/kbd-search.tsx"],
    rules: { "jsx-a11y/no-noninteractive-element-interactions": "off" },
  },
  {
    // Addon clicks delegate focus to the input; the addon is not a separate control.
    files: ["packages/react/src/components/input-group/input-group.tsx"],
    rules: {
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },
  {
    files: ["packages/react/**/*.{ts,tsx}", "apps/docs/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
      },
    },
  },
);
