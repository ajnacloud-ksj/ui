import type { InferPageType } from "fumadocs-core/source";

import type { source } from "@/lib/source";

type DocsPage = InferPageType<typeof source>;

export function getMarkdownUrl(page: DocsPage) {
  const path = page.slugs.map(encodeURIComponent).join("/");
  return path ? `/llms.mdx/${path}` : "/llms.mdx";
}

export async function getPageMarkdown(page: DocsPage) {
  return [
    `# ${page.data.title}`,
    page.data.description,
    await page.data.getText("processed"),
  ]
    .filter(Boolean)
    .join("\n\n");
}
