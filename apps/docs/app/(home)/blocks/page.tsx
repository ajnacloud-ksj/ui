import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { blocks } from "@/blocks/catalog";
import { BlockThumbnail } from "@/components/blocks/block-thumbnail";

export const metadata = {
  title: "Blocks",
  description:
    "Application layouts, pages, and workflows built with Ajna. Preview responsive examples and copy their source.",
};

export default function Blocks() {
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 py-12 sm:py-16">
        <div>
          <p className="mb-3 text-sm font-medium text-fd-primary">
            Built with Ajna
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Application blocks.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-fd-muted-foreground">
            Layouts, pages, and workflows you can preview, copy, and adapt.
          </p>
        </div>
        <Link
          href="/docs/installation"
          className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
        >
          Installation
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </header>
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {blocks.map((block) => (
          <Link
            key={block.slug}
            href={`/blocks/${block.slug}`}
            className="group min-w-0 rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
          >
            <div className="overflow-hidden rounded-2xl border border-fd-border transition-colors group-hover:border-fd-primary/40 motion-reduce:transition-none">
              <BlockThumbnail slug={block.slug} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium tracking-tight">
                    {block.title}
                  </h2>
                  <span className="text-xs text-fd-muted-foreground">
                    {block.category}
                  </span>
                </div>
                <p className="mt-1.5 max-w-lg text-sm leading-6 text-fd-muted-foreground">
                  {block.description}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-fd-muted-foreground group-hover:text-fd-primary"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
