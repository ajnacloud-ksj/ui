"use client";

import {
  Button,
  ButtonGroup,
  CopyButton,
  DropdownMenu,
  toast,
} from "@ajnacloud/ui";
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  FileText,
  Link,
  Sparkles,
  SquareTerminal,
} from "lucide-react";
import { useState } from "react";

const itemClassName = "gap-3 rounded-lg px-3 py-2.5";

function reportCopyError() {
  toast.add({
    type: "error",
    title: "Could not copy",
    description: "Check your browser's clipboard permissions and try again.",
  });
}

async function copyText(value: string, title: string, description?: string) {
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(value);
    toast.add({ title, description });
  } catch {
    reportCopyError();
  }
}

export function DocsPageActions({
  markdown,
  markdownUrl,
  pageUrl,
}: {
  markdown: string;
  markdownUrl: string;
  pageUrl: string;
}) {
  const [absolutePageUrl, setAbsolutePageUrl] = useState("");
  const prompt = `Read ${absolutePageUrl} and its Markdown reference at ${absolutePageUrl ? new URL(markdownUrl, absolutePageUrl).href : markdownUrl}. I want to ask questions about this Ajna documentation. Use the APIs documented on this page.`;
  const providers = [
    {
      name: "ChatGPT",
      icon: Bot,
      href: `https://chatgpt.com/?${new URLSearchParams({ prompt, hints: "search" })}`,
    },
    {
      name: "Claude",
      icon: Sparkles,
      href: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
    },
    {
      name: "Cursor",
      icon: SquareTerminal,
      href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: prompt })}`,
    },
  ];

  return (
    <ButtonGroup aria-label="Page actions" className="shrink-0">
      <CopyButton
        value={markdown}
        variant="outline"
        copyLabel="Copy page as Markdown"
        copiedLabel="Copied"
        errorLabel="Failed"
        className="h-8 min-w-24 px-2.5 text-[13px]"
        onCopyError={reportCopyError}
      >
        Copy page
      </CopyButton>
      <DropdownMenu.Root
        onOpenChange={(open) => {
          if (open) {
            setAbsolutePageUrl(new URL(pageUrl, window.location.origin).href);
          }
        }}
      >
        <DropdownMenu.Trigger
          render={
            <Button
              variant="outline"
              shape="square"
              aria-label="More page actions"
              className="h-8 w-8"
            />
          }
        >
          <ChevronDown aria-hidden="true" className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="w-72 rounded-2xl p-2"
        >
          <DropdownMenu.Item
            className={itemClassName}
            onClick={() => void copyText(markdown, "Page copied")}
          >
            <FileText aria-hidden="true" />
            <span className="flex flex-col text-start">
              <span>Copy page as Markdown</span>
              <span className="text-xs text-[hsl(var(--ajna-muted-foreground))]">
                For AI tools and notes
              </span>
            </span>
          </DropdownMenu.Item>
          <DropdownMenu.LinkItem
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClassName}
          >
            <FileText aria-hidden="true" />
            View as Markdown
            <ArrowUpRight aria-hidden="true" className="ms-auto" />
          </DropdownMenu.LinkItem>
          <DropdownMenu.Item
            className={itemClassName}
            onClick={() => void copyText(absolutePageUrl, "Page link copied")}
          >
            <Link aria-hidden="true" />
            Copy page link
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Label>Ask about this page</DropdownMenu.Label>
            {providers.map(({ name, icon: Icon, href }) => (
              <DropdownMenu.LinkItem
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClassName}
              >
                <Icon aria-hidden="true" />
                Open in {name}
                <ArrowUpRight aria-hidden="true" className="ms-auto" />
              </DropdownMenu.LinkItem>
            ))}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ButtonGroup>
  );
}
