import { readFile } from "node:fs/promises";
import { join, posix } from "node:path";

import { type Block } from "@/blocks/catalog";

export async function getBlockFiles(block: Block) {
  return Promise.all(
    [...block.files, "tailwind-v4.css"].map(async (path) => {
      const source = await readFile(
        join(process.cwd(), "blocks", path),
        "utf8",
      );
      const code = source.replace(
        /(["'])@\/blocks\/([^"']+)\1/g,
        (_, quote: string, target: string) => {
          const relative = posix.relative(posix.dirname(path), target);
          return `${quote}${relative.startsWith(".") ? relative : `./${relative}`}${quote}`;
        },
      );
      return {
        path: `blocks/${path}`,
        code,
        lang: path.endsWith(".css")
          ? "css"
          : path.endsWith(".tsx")
            ? "tsx"
            : "ts",
      };
    }),
  );
}

export async function getBlockMarkdown(block: Block) {
  const files = await getBlockFiles(block);
  return [
    `# ${block.title}`,
    block.description,
    "## Setup",
    'Install @ajnacloud/ui and lucide-react, then configure styles using /docs/installation. Blocks require an application Tailwind build. With Tailwind v3.4, use Ajna\'s preset and include the copied files in content. With Tailwind v4, import @ajnacloud/ui/styles.css and the included blocks/tailwind-v4.css in your application stylesheet after @import "tailwindcss". Do not import tailwind-v4.css with Tailwind v3.4.',
    "## Usage",
    `\`\`\`tsx\n${block.usage}\n\`\`\``,
    "## Integration",
    ...block.notes.map((note) => `- ${note}`),
    "## Source",
    ...files.map(
      (file) => `### ${file.path}\n\n\`\`\`${file.lang}\n${file.code}\n\`\`\``,
    ),
  ].join("\n\n");
}
