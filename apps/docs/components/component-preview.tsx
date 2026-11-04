"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/ui/tabs";
import { Children, isValidElement, type ReactNode } from "react";

import {
  previewTabClassName,
  previewTabsListClassName,
} from "@/components/preview-tabs";

type CodeSlot = { "data-preview-code"?: string; children?: ReactNode };

const panelClassName =
  "min-w-0 rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring data-[state=inactive]:hidden";

export function ComponentPreview({
  children,
  label = "Preview",
}: {
  children: ReactNode;
  label?: string;
}) {
  const nodes = Children.toArray(children);
  const code = nodes.find(
    (node) =>
      isValidElement<CodeSlot>(node) &&
      node.props["data-preview-code"] !== undefined,
  );
  const preview = nodes.filter((node) => node !== code);

  return (
    <Tabs
      defaultValue="preview"
      className="component-preview not-prose my-8 min-w-0"
    >
      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <TabsList
          aria-label={`${label} example`}
          className={previewTabsListClassName}
        >
          <TabsTrigger value="preview" className={previewTabClassName}>
            Preview
          </TabsTrigger>
          {code && (
            <TabsTrigger value="code" className={previewTabClassName}>
              Code
            </TabsTrigger>
          )}
        </TabsList>
        {label !== "Preview" && (
          <span className="text-xs leading-5 text-fd-muted-foreground">
            {label}
          </span>
        )}
      </div>
      <TabsContent value="preview" forceMount className={panelClassName}>
        <div
          aria-label={label === "Preview" ? "Component preview" : label}
          className="flex min-h-72 min-w-0 items-center justify-center overflow-x-auto rounded-2xl border border-fd-border px-5 py-10 text-sm leading-6 text-[hsl(var(--ajna-foreground))] sm:min-h-96 sm:px-8 sm:py-12"
        >
          <div className="flex w-full min-w-0 flex-col items-center justify-center gap-6 [&>*]:max-w-full">
            {preview}
          </div>
        </div>
      </TabsContent>
      {code && (
        <TabsContent
          value="code"
          forceMount
          className={`${panelClassName} overflow-hidden border border-fd-border [&_figure]:m-0 [&_figure]:rounded-none [&_figure]:border-0 [&_pre]:max-h-[32rem]`}
        >
          {code}
        </TabsContent>
      )}
    </Tabs>
  );
}
