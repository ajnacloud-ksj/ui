import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { HomeShowcase } from "@/components/home-showcase";

export default function Home() {
  return (
    <>
      <section className="max-w-3xl py-12 sm:py-16 lg:py-20">
        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          React components for application interfaces.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-fd-muted-foreground sm:text-lg">
          React components built on Base UI. Use Tailwind CSS 3.4 or standalone
          CSS.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/docs/components/button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary motion-reduce:transition-none"
          >
            Browse components{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/blocks"
            className="inline-flex h-10 items-center justify-center rounded-md border border-fd-border px-4 text-sm font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary motion-reduce:transition-none"
          >
            Browse blocks
          </Link>
        </div>
      </section>
      <HomeShowcase />
    </>
  );
}
