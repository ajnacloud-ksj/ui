import { fileURLToPath } from "node:url";

import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
export default withMDX({
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  outputFileTracingIncludes: {
    "/blocks/**": ["./blocks/**/*"],
    "/skills/**": ["../../skills/**/*"],
    "/llms-full.txt": ["./blocks/**/*"],
  },
  poweredByHeader: false,
  transpilePackages: ["@ajnacloud/ui"],
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
});
