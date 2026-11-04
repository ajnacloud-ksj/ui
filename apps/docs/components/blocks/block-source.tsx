import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";

import { BlockSourceFiles } from "@/components/blocks/block-source-files";
import type { getBlockFiles } from "@/lib/blocks";

export async function BlockSource({
  files,
}: {
  files: Awaited<ReturnType<typeof getBlockFiles>>;
}) {
  const highlighted = await Promise.all(
    files.map(async (file) => ({
      path: file.path,
      content: await ServerCodeBlock({
        code: file.code,
        lang: file.lang,
        themes: { light: "github-light", dark: "github-dark" },
        codeblock: {
          className: "m-0 rounded-none border-0",
          viewportProps: {
            "aria-label": `${file.path} source code`,
            className: "max-h-[600px]",
          },
        },
      }),
    })),
  );
  return <BlockSourceFiles files={highlighted} />;
}
