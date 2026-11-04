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

export function DrawerPositions() {
  const positions = [
    { direction: "down", label: "Bottom" },
    { direction: "up", label: "Top" },
    { direction: "left", label: "Left" },
    { direction: "right", label: "Right" },
  ] as const;
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {positions.map(({ direction, label }) => (
        <Drawer key={direction} swipeDirection={direction} showSwipeHandle>
          <DrawerTrigger render={<Button variant="outline" />}>
            Open {label.toLowerCase()} drawer
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{label} drawer</DrawerTitle>
              <DrawerDescription>
                Swipe {direction} to dismiss this panel, or use its close
                button.
              </DrawerDescription>
            </DrawerHeader>
            <div style={{ padding: 16 }}>
              Use this space for supporting information or actions.
            </div>
            <DrawerFooter>
              <DrawerClose render={<Button variant="secondary" />}>
                Close {label.toLowerCase()} drawer
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
