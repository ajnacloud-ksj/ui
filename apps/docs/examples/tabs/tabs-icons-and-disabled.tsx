"use client";

import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";
import { CreditCard, Settings, Users } from "lucide-react";

export function TabsIconsAndDisabled() {
  return (
    <Tabs defaultValue="general" style={{ width: "100%", maxWidth: 480 }}>
      <TabsList variant="underline" aria-label="Organization settings">
        <TabsTrigger value="general">
          <Settings aria-hidden="true" /> General
        </TabsTrigger>
        <TabsTrigger value="members">
          <Users aria-hidden="true" /> Members{" "}
          <Badge variant="secondary">8</Badge>
        </TabsTrigger>
        <TabsTrigger value="billing" disabled>
          <CreditCard aria-hidden="true" /> Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        Choose your organization's default preferences.
      </TabsContent>
      <TabsContent value="members">
        There are eight people in this organization.
      </TabsContent>
      <TabsContent value="billing">
        Billing is available to workspace owners.
      </TabsContent>
    </Tabs>
  );
}
