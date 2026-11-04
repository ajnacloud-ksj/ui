import { HomeLayout } from "fumadocs-ui/layouts/home";

import { SiteHeader } from "@/components/site-header";
import { baseOptions, layoutStyle } from "@/lib/layout.shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      style={layoutStyle}
      slots={{ header: SiteHeader }}
    >
      <div className="mx-auto w-full max-w-(--fd-layout-width) px-6 pb-16">
        {children}
      </div>
    </HomeLayout>
  );
}
