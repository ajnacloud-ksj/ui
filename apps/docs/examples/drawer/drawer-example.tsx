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

export function DrawerExample() {
  const [savedGoal, setSavedGoal] = useState(250);
  const [draft, setDraft] = useState(250);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Drawer
        showSwipeHandle
        onOpenChange={(open) => {
          if (open) setDraft(savedGoal);
        }}
      >
        <DrawerTrigger render={<Button variant="secondary" />}>
          Set daily goal
        </DrawerTrigger>
        <DrawerContent>
          <div
            style={{
              marginInline: "auto",
              width: "100%",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <DrawerHeader>
              <DrawerTitle>Daily move goal</DrawerTitle>
              <DrawerDescription>
                Choose the calories you want to burn each day.
              </DrawerDescription>
            </DrawerHeader>
            <div
              style={{
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
              }}
            >
              <Button
                variant="secondary"
                shape="circle"
                aria-label="Decrease daily goal"
                disabled={draft <= 50}
                onClick={() => setDraft((goal) => goal - 50)}
              >
                −
              </Button>
              <div style={{ textAlign: "center" }}>
                <output
                  aria-live="polite"
                  style={{
                    display: "block",
                    fontSize: 48,
                    lineHeight: 1.1,
                    fontWeight: 600,
                  }}
                >
                  {draft}
                </output>
                <span>calories / day</span>
              </div>
              <Button
                variant="secondary"
                shape="circle"
                aria-label="Increase daily goal"
                disabled={draft >= 1000}
                onClick={() => setDraft((goal) => goal + 50)}
              >
                +
              </Button>
            </div>
            <DrawerFooter>
              <DrawerClose
                render={<Button variant="primary" />}
                onClick={() => setSavedGoal(draft)}
              >
                Save goal
              </DrawerClose>
              <DrawerClose render={<Button variant="outline" />}>
                Cancel goal changes
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <span role="status">Saved daily goal: {savedGoal} calories.</span>
    </div>
  );
}
