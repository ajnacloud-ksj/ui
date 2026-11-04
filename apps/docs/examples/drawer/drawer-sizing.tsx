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

export function DrawerSizing() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open half-height drawer
      </DrawerTrigger>
      <DrawerContent style={{ height: "50vh" }}>
        <DrawerHeader>
          <DrawerTitle>Scrollable history</DrawerTitle>
          <DrawerDescription>
            The header and footer stay outside the scrolling region.
          </DrawerDescription>
        </DrawerHeader>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>
          <ol
            style={{
              margin: 0,
              paddingInlineStart: 24,
              display: "grid",
              gap: 16,
            }}
          >
            {Array.from({ length: 30 }, (_, index) => (
              <li key={index}>History entry {index + 1}</li>
            ))}
          </ol>
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="secondary" />}>
            Close history
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
