"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/ui/tabs";
import { Maximize2, Monitor, Smartphone } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  previewTabClassName,
  previewTabsListClassName,
} from "@/components/preview-tabs";

const controlClass =
  "inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground outline-none transition-colors hover:bg-fd-muted hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring aria-pressed:bg-fd-secondary aria-pressed:text-fd-foreground motion-reduce:transition-none";

export function BlockPreview({
  slug,
  title,
  source,
  formVariants = false,
  collectionStates = false,
}: {
  slug: string;
  title: string;
  source: ReactNode;
  formVariants?: boolean;
  collectionStates?: boolean;
}) {
  const [mobile, setMobile] = useState(false);
  const [variant, setVariant] = useState("create");
  const [state, setState] = useState("ready");
  const [tab, setTab] = useState("preview");
  const url = `/blocks/preview/${slug}${formVariants ? `?variant=${variant}` : collectionStates ? `?state=${state}` : ""}`;
  return (
    <Tabs value={tab} onValueChange={setTab} className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabsList
          aria-label="Block content"
          className={previewTabsListClassName}
        >
          <TabsTrigger value="preview" className={previewTabClassName}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="source" className={previewTabClassName}>
            Source
          </TabsTrigger>
        </TabsList>
        <div
          className={tab === "preview" ? "flex items-center gap-2" : "hidden"}
        >
          {collectionStates && (
            <label className="me-2 text-xs text-fd-muted-foreground">
              State{" "}
              <select
                value={state}
                onChange={(event) => setState(event.target.value)}
                className="ms-2 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-sm text-fd-foreground"
              >
                <option value="ready">Ready</option>
                <option value="loading">Loading</option>
                <option value="empty">Empty</option>
                <option value="error">Error</option>
              </select>
            </label>
          )}
          {formVariants && (
            <label className="me-2 text-xs text-fd-muted-foreground">
              Mode{" "}
              <select
                value={variant}
                onChange={(event) => setVariant(event.target.value)}
                className="ms-2 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-sm text-fd-foreground"
              >
                <option value="create">Create</option>
                <option value="edit">Edit</option>
              </select>
            </label>
          )}
          <div
            role="group"
            aria-label="Preview viewport"
            className="flex rounded-lg border border-fd-border p-0.5"
          >
            <button
              type="button"
              aria-label="Desktop preview"
              aria-pressed={!mobile}
              onClick={() => setMobile(false)}
              className={controlClass}
            >
              <Monitor aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Mobile preview"
              aria-pressed={mobile}
              onClick={() => setMobile(true)}
              className={controlClass}
            >
              <Smartphone aria-hidden="true" className="size-4" />
            </button>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} preview in a new tab`}
            className={controlClass}
          >
            <Maximize2 aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
      <TabsContent
        value="preview"
        forceMount
        className="min-w-0 rounded-2xl outline-none data-[state=inactive]:hidden"
      >
        <div
          className={`overflow-hidden rounded-2xl border border-fd-border bg-fd-muted ${mobile ? "p-3 sm:p-6" : ""}`}
        >
          <iframe
            key={`${variant}-${state}`}
            src={url}
            title={`${title} interactive preview`}
            className={`block h-[720px] w-full bg-fd-background ${mobile ? "mx-auto max-w-[390px] rounded-xl border border-fd-border" : ""}`}
            loading="lazy"
          />
        </div>
      </TabsContent>
      <TabsContent
        value="source"
        forceMount
        className="min-w-0 outline-none data-[state=inactive]:hidden"
      >
        {source}
      </TabsContent>
    </Tabs>
  );
}
