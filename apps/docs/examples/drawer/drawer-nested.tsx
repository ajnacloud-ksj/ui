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

export function DrawerNested() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open account drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Account settings</DrawerTitle>
          <DrawerDescription>
            Review your account and manage its security.
          </DrawerDescription>
        </DrawerHeader>
        <div style={{ padding: 16 }}>Your account is active and protected.</div>
        <DrawerFooter>
          <Drawer showSwipeHandle>
            <DrawerTrigger render={<Button variant="primary" />}>
              Review account security
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Account security</DrawerTitle>
                <DrawerDescription>
                  Security settings stay separate from the parent drawer.
                </DrawerDescription>
              </DrawerHeader>
              <div style={{ padding: 16, display: "grid", gap: 12 }}>
                <p style={{ margin: 0 }}>
                  Two-factor authentication is enabled.
                </p>
                <p style={{ margin: 0 }}>No unfamiliar sessions were found.</p>
              </div>
              <DrawerFooter>
                <DrawerClose render={<Button variant="secondary" />}>
                  Back to account settings
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <DrawerClose render={<Button variant="outline" />}>
            Close account settings
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
