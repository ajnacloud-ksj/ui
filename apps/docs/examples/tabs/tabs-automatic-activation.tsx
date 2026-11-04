"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsAutomaticActivation() {
  return (
    <Tabs defaultValue="design">
      <TabsList activateOnFocus aria-label="Team updates">
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="engineering">Engineering</TabsTrigger>
        <TabsTrigger value="support">Support</TabsTrigger>
      </TabsList>
      <TabsContent value="design">
        The new component designs are ready for review.
      </TabsContent>
      <TabsContent value="engineering">
        The latest release is deployed to staging.
      </TabsContent>
      <TabsContent value="support">
        All priority requests have been answered.
      </TabsContent>
    </Tabs>
  );
}
