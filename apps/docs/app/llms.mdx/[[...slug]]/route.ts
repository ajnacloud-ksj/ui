import { getPageMarkdown } from "@/lib/markdown";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export function generateStaticParams() {
  return source.generateParams();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const page = source.getPage((await params).slug);
  if (!page) return new Response("Page not found", { status: 404 });

  return new Response(await getPageMarkdown(page), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
