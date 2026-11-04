import { AjnaLogo } from "@ajnacloud/ui";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { CSSProperties } from "react";

export const layoutStyle = { "--fd-layout-width": "1400px" } as CSSProperties;

export const siteLinks = [
  {
    text: "Components",
    url: "/docs/components/button",
    prefix: "/docs/components",
  },
  { text: "Blocks", url: "/blocks", prefix: "/blocks" },

  { text: "Docs", url: "/docs", prefix: "/docs" },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <AjnaLogo color="current" width={96} />,
    },
    links: siteLinks.map(({ text, url }) => ({ text, url })),
  };
}
