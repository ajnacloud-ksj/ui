"use client";

import {
  Field,
  FieldLabel,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ajnacloud/ui";
import { useId } from "react";

export function TabsKeepMounted() {
  const id = useId();
  return (
    <Tabs defaultValue="profile" style={{ width: "100%", maxWidth: 400 }}>
      <TabsList aria-label="Profile settings">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" keepMounted>
        <Field>
          <FieldLabel htmlFor={id}>Display name</FieldLabel>
          <Input id={id} defaultValue="Alex Morgan" />
        </Field>
      </TabsContent>
      <TabsContent value="preferences">
        Change the display name, switch to this tab, and return. Your draft
        stays in the input.
      </TabsContent>
    </Tabs>
  );
}
