"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ajnacloud/ui";
import { useState } from "react";

export function TabsControlled() {
  const [value, setValue] = useState("monthly");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList aria-label="Billing period">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          Pay each month. Change your plan at any time.
        </TabsContent>
        <TabsContent value="yearly">Pay once a year and save 20%.</TabsContent>
      </Tabs>
      <p style={{ margin: 0 }}>Selected period: {value}</p>
    </div>
  );
}
