"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsExample() {
  return (
    <Tabs defaultValue="overview" style={{ width: "100%", maxWidth: 480 }}>
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        Your project has 12 active members and three deployments this week.
      </TabsContent>
      <TabsContent value="activity">
        The latest deployment finished two hours ago.
      </TabsContent>
      <TabsContent value="settings">
        Manage project details, member access, and notifications.
      </TabsContent>
    </Tabs>
  );
}
