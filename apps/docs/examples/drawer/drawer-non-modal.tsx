"use client";

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@ajnacloud/ui";
import { useState } from "react";

export function DrawerNonModal() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button
        variant="secondary"
        onClick={() => setCount((value) => value + 1)}
      >
        Background count: {count}
      </Button>
      <Drawer
        modal={false}
        disablePointerDismissal
        swipeDirection="right"
        showSwipeHandle
      >
        <DrawerTrigger render={<Button variant="outline" />}>
          Open supporting details
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Supporting details</DrawerTitle>
            <DrawerDescription>
              This drawer leaves the page available for interaction.
            </DrawerDescription>
          </DrawerHeader>
          <div style={{ padding: 16 }}>
            The background counter remains usable. Outside presses leave this
            panel open; Escape and the close button still dismiss it.
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="secondary" />}>
              Close supporting details
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
