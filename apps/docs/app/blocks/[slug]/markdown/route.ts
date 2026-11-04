import { blocks, getBlock } from "@/blocks/catalog";
import { getBlockMarkdown } from "@/lib/blocks";

export const dynamic = "force-static";
export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const block = getBlock((await params).slug);
  if (!block) return new Response("Block not found", { status: 404 });
  return new Response(await getBlockMarkdown(block), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
