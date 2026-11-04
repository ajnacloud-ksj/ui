import { DocsLayout } from "fumadocs-ui/layouts/notebook";

import { DocsHeader } from "@/components/site-header";
import { baseOptions } from "@/lib/layout.shared";
import { createDocsTree } from "@/lib/navigation";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = baseOptions();
  return (
    <DocsLayout
      {...options}
      tree={createDocsTree(source.pageTree)}
      nav={{ ...options.nav, mode: "top" }}
      tabs={false}
      slots={{ header: DocsHeader }}
      sidebar={{
        collapsible: false,
        className:
          "docs-sidebar border-fd-border max-md:inset-s-0 max-md:inset-e-auto max-md:border-s-0 max-md:border-e max-md:[--fd-sidebar-drawer-offset:-100%] md:border-e",
      }}
      containerProps={{ className: "docs-layout" }}
    >
      {children}
    </DocsLayout>
  );
}
