import "@ajnacloud/ui/styles.css";
import "./global.css";

import { Toaster } from "@ajnacloud/ui";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Ajna — React components for application interfaces",
    template: "%s · Ajna",
  },
  description:
    "React components built on Base UI. Use Tailwind CSS 3.4 or standalone CSS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider theme={{ defaultTheme: "light" }}>
          <Toaster>
            <div className="app-root">{children}</div>
          </Toaster>
        </RootProvider>
      </body>
    </html>
  );
}
