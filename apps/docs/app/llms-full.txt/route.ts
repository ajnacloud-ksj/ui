import { blocks } from "@/blocks/catalog";
import { getBlockMarkdown } from "@/lib/blocks";
import { getPageMarkdown } from "@/lib/markdown";
import { source } from "@/lib/source";

export const dynamic = "force-static";
export async function GET() {
  const pages = await Promise.all([
    ...source.getPages().map(getPageMarkdown),
    ...blocks.map(getBlockMarkdown),
  ]);
  return new Response(pages.join("\n\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
