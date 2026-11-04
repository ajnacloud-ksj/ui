"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsOverflow() {
  const sections = [
    "Overview",
    "Analytics",
    "Deployments",
    "Notifications",
    "Settings",
    "Billing",
    "Security",
  ];
  return (
    <Tabs defaultValue="Overview" style={{ width: "100%", maxWidth: 360 }}>
      <TabsList aria-label="Project navigation">
        {sections.map((section) => (
          <TabsTrigger key={section} value={section}>
            {section}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section} value={section}>
          {section} for your project.
        </TabsContent>
      ))}
    </Tabs>
  );
}
