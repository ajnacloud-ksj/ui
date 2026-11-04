import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blocks, getBlock } from "@/blocks/catalog";
import { BlockPreview } from "@/components/blocks/block-preview";
import { BlockSource } from "@/components/blocks/block-source";
import { DocsPageActions } from "@/components/docs-page-actions";
import { getBlockFiles, getBlockMarkdown } from "@/lib/blocks";

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const block = getBlock((await params).slug);
  return block
    ? {
        title: block.title,
        description: block.description,
        alternates: {
          types: { "text/markdown": `/blocks/${block.slug}/markdown` },
        },
      }
    : {};
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const block = getBlock((await params).slug);
  if (!block) notFound();
  const [files, markdown] = await Promise.all([
    getBlockFiles(block),
    getBlockMarkdown(block),
  ]);
  return (
    <article>
      <header className="py-9 sm:py-12">
        <Link
          href="/blocks"
          className="mb-6 inline-flex items-center gap-2 text-sm text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Blocks
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {block.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-fd-muted-foreground">
              {block.description}
            </p>
          </div>
          <DocsPageActions
            key={block.slug}
            markdown={markdown}
            markdownUrl={`/blocks/${block.slug}/markdown`}
            pageUrl={`/blocks/${block.slug}`}
          />
        </div>
      </header>
      <BlockPreview
        slug={block.slug}
        title={block.title}
        formVariants={block.slug === "record-form"}
        collectionStates={block.slug === "collection-page"}
        source={<BlockSource files={files} />}
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Use this block
          </h2>
          <ol className="list-decimal space-y-3 ps-5 text-sm leading-6 text-fd-muted-foreground">
            <li>
              Complete{" "}
              <Link
                href="/docs/installation"
                className="text-fd-foreground underline underline-offset-4"
              >
                Ajna installation
              </Link>{" "}
              and install{" "}
              <Link
                href="/docs/icons"
                className="text-fd-foreground underline underline-offset-4"
              >
                Lucide
              </Link>{" "}
              for the example icons.
            </li>
            <li>
              Copy the files in the Source tab, keeping the displayed{" "}
              <code className="text-xs text-fd-foreground">blocks/</code> folder
              structure. Imports in the copied files are relative.
            </li>
            <li>
              Include the copied files in your Tailwind build. Tailwind v3.4
              uses Ajna's preset. For Tailwind v4, import the included{" "}
              <code className="text-xs text-fd-foreground">
                blocks/tailwind-v4.css
              </code>{" "}
              after your Tailwind import, alongside Ajna's standalone
              stylesheet.
            </li>
            <li>
              Replace the example's local callbacks with your application's data
              and navigation.
            </li>
          </ol>
          <p className="text-xs leading-5 text-fd-muted-foreground">
            The Tailwind v4 file only maps utilities to existing Ajna tokens.
            Tailwind v3.4 applications do not need it.
          </p>
          <a
            href={`/blocks/${block.slug}/markdown`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-fd-primary underline-offset-4 hover:underline"
          >
            Read the complete source as Markdown
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Included</h2>
          <ul className="list-disc space-y-2 ps-5 text-sm leading-6 text-fd-muted-foreground">
            {block.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-10 max-w-3xl">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Usage</h2>
        <ServerCodeBlock
          code={block.usage}
          lang="tsx"
          themes={{ light: "github-light", dark: "github-dark" }}
          codeblock={{ title: "app.tsx" }}
        />
      </section>
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">Integration</h2>
        <ul className="mt-4 list-disc space-y-3 ps-5 text-sm leading-6 text-fd-muted-foreground">
          {block.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
