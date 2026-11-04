"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";
import { useId, useRef, useState } from "react";

export function DialogForm() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState("");
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="primary" />}>
          Create project
        </DialogTrigger>
        <DialogContent initialFocus={input}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Enter a name for the project.</DialogDescription>
          </DialogHeader>
          <form
            style={{ display: "grid", gap: 16 }}
            onSubmit={(event) => {
              event.preventDefault();
              setCreated(
                String(new FormData(event.currentTarget).get("project")),
              );
              setOpen(false);
            }}
          >
            <Field>
              <FieldLabel htmlFor={id}>Project name</FieldLabel>
              <Input id={id} ref={input} name="project" required />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary" />}>
                Cancel
              </DialogClose>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {created && <p role="status">Created “{created}”.</p>}
    </div>
  );
}
