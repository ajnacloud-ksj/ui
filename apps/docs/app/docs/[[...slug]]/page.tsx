import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/notebook/page";
import { notFound } from "next/navigation";

import { DocsPageActions } from "@/components/docs-page-actions";
import { DocsPageNavigation } from "@/components/docs-page-navigation";
import { getMarkdownUrl, getPageMarkdown } from "@/lib/markdown";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

type PageProps = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      className="gap-0 pt-8 xl:pt-10"
      breadcrumb={{ enabled: false }}
      slots={{ footer: DocsPageNavigation }}
      footer={{ className: "mt-12" }}
      tableOfContent={{ container: { className: "pt-10" } }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DocsTitle className="text-3xl leading-tight tracking-tight">
          {page.data.title}
        </DocsTitle>
        <DocsPageActions
          key={page.url}
          pageUrl={page.url}
          markdownUrl={getMarkdownUrl(page)}
          markdown={await getPageMarkdown(page)}
        />
      </div>
      <DocsDescription className="mt-3 mb-6 border-b border-fd-border pb-6 text-base leading-6">
        {page.data.description}
      </DocsDescription>
      <DocsBody className="docs-prose">
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata({ params }: PageProps) {
  const page = source.getPage((await params).slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { types: { "text/markdown": getMarkdownUrl(page) } },
  };
}
