"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";

export function TabsVertical() {
  return (
    <Tabs
      orientation="vertical"
      defaultValue="account"
      style={{ width: "100%", maxWidth: 480 }}
    >
      <TabsList variant="underline" aria-label="Account settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Edit your profile and account information.
      </TabsContent>
      <TabsContent value="password">
        Change your password and review security settings.
      </TabsContent>
      <TabsContent value="notifications">
        Choose which updates you receive.
      </TabsContent>
    </Tabs>
  );
}
