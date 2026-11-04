"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsSizes() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(["sm", "base"] as const).map((size) => (
        <Tabs key={size} defaultValue="recent">
          <TabsList size={size} aria-label={`Projects, ${size} size`}>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All projects</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">Recently updated projects.</TabsContent>
          <TabsContent value="all">All projects in your workspace.</TabsContent>
        </Tabs>
      ))}
    </div>
  );
}
