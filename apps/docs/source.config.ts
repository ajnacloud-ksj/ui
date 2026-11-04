import { defineConfig } from "fumadocs-mdx/config";
import { createGenerator, remarkAutoTypeTable } from "fumadocs-typescript";

import { remarkComponentPreview } from "./lib/remark-component-preview";

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkComponentPreview,
      [
        remarkAutoTypeTable,
        {
          generator: createGenerator({
            tsconfigPath: "../../packages/react/tsconfig.build.json",
          }),
        },
      ],
    ],
  },
});
