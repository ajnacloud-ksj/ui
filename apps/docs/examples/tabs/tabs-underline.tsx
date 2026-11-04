"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsUnderline() {
  return (
    <Tabs defaultValue="general" style={{ width: "100%", maxWidth: 480 }}>
      <TabsList variant="underline" aria-label="Workspace settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        Update your workspace name and preferences.
      </TabsContent>
      <TabsContent value="members">
        Invite teammates and manage their permissions.
      </TabsContent>
      <TabsContent value="billing">
        Review your plan and download invoices.
      </TabsContent>
    </Tabs>
  );
}
