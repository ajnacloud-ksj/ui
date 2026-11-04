"use client";

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  type DrawerSnapPoint,
  DrawerTitle,
  DrawerTrigger,
} from "@ajnacloud/ui";
import { useState } from "react";

export function DrawerSnapPoints() {
  const points = [0.25, 0.6, 1];
  const [point, setPoint] = useState<DrawerSnapPoint | null>(0.6);
  return (
    <Drawer
      snapPoints={points}
      snapPoint={point}
      onSnapPointChange={setPoint}
      snapToSequentialPoints
      showSwipeHandle
    >
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open reading list
      </DrawerTrigger>
      <DrawerContent initialFocus={false}>
        <DrawerHeader>
          <DrawerTitle>Reading list</DrawerTitle>
          <DrawerDescription>
            Drag the handle or choose how much of the list to show.
          </DrawerDescription>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {points.map((value) => (
              <Button
                key={value}
                size="sm"
                aria-pressed={point === value}
                variant={point === value ? "primary" : "outline"}
                onClick={() => setPoint(value)}
              >
                {Math.round(value * 100)}%
              </Button>
            ))}
            <DrawerClose render={<Button variant="secondary" size="sm" />}>
              Close reading list
            </DrawerClose>
          </div>
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
            {Array.from({ length: 24 }, (_, index) => (
              <li key={index}>Reading list item {index + 1}</li>
            ))}
          </ol>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
