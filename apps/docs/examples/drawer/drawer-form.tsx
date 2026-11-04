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
  Field,
  FieldLabel,
  Input,
  Textarea,
} from "@ajnacloud/ui";
import { Drawer as DrawerPrimitive } from "@ajnacloud/ui/primitives/drawer";
import { useId, useRef, useState } from "react";

export function DrawerForm() {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    bio: "Building useful things.",
  });
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerPrimitive.VirtualKeyboardProvider>
          <DrawerTrigger render={<Button variant="secondary" />}>
            Edit drawer profile
          </DrawerTrigger>
          <DrawerContent initialFocus={nameRef}>
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                maxWidth: 480,
                width: "100%",
                marginInline: "auto",
              }}
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setProfile({
                  name: String(data.get("name")).trim(),
                  bio: String(data.get("bio")).trim(),
                });
                setOpen(false);
              }}
            >
              <DrawerHeader>
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                  Save your display name and a short introduction.
                </DrawerDescription>
              </DrawerHeader>
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  padding: 16,
                  minHeight: 0,
                  overflowY: "auto",
                }}
              >
                <Field>
                  <FieldLabel htmlFor={`${id}-name`}>Display name</FieldLabel>
                  <Input
                    id={`${id}-name`}
                    name="name"
                    ref={nameRef}
                    autoComplete="name"
                    defaultValue={profile.name}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-bio`}>About you</FieldLabel>
                  <Textarea
                    id={`${id}-bio`}
                    name="bio"
                    defaultValue={profile.bio}
                    rows={3}
                  />
                </Field>
              </div>
              <DrawerFooter>
                <Button type="submit" variant="primary">
                  Save profile
                </Button>
                <DrawerClose render={<Button variant="outline" />}>
                  Cancel profile changes
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </DrawerPrimitive.VirtualKeyboardProvider>
      </Drawer>
      <span role="status">Profile saved as {profile.name}.</span>
    </div>
  );
}
