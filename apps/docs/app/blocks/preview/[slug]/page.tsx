import { notFound } from "next/navigation";

import { AppShellExample } from "@/blocks/app-shell/app-shell-example";
import { blocks, getBlock } from "@/blocks/catalog";
import { CollectionPageExample } from "@/blocks/collection-page/collection-page-example";
import { ConfirmationExample } from "@/blocks/confirmation/confirmation-example";
import { LoginPageExample } from "@/blocks/login-page/login-page-example";
import { PageShellExample } from "@/blocks/page-shell/page-shell-example";
import { RecordFormExample } from "@/blocks/record-form/record-form-example";
import { ViewSwitcherExample } from "@/blocks/view-switcher/view-switcher-example";

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const block = getBlock((await params).slug);
  return {
    title: block ? `${block.title} preview` : "Preview",
    robots: { index: false, follow: false },
  };
}

export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string; state?: string }>;
}) {
  const { slug } = await params;
  if (!getBlock(slug)) notFound();
  switch (slug) {
    case "app-shell":
      return <AppShellExample />;
    case "page-shell":
      return <PageShellExample />;
    case "collection-page": {
      const { state } = await searchParams;
      return (
        <CollectionPageExample
          initialState={
            state === "loading" || state === "empty" || state === "error"
              ? state
              : "ready"
          }
        />
      );
    }
    case "login-page":
      return <LoginPageExample />;
    case "record-form":
      return (
        <RecordFormExample edit={(await searchParams).variant === "edit"} />
      );
    case "confirmation":
      return <ConfirmationExample />;
    case "view-switcher":
      return <ViewSwitcherExample />;
    default:
      notFound();
  }
}
