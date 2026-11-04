"use client";

import { AlertDialog, Button } from "@ajnacloud/ui";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function AlertDialogDestructive() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [removed, setRemoved] = useState(false);
  async function removeProject() {
    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setRemoved(true);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-3">
      <AlertDialog
        open={open}
        onOpenChange={(next, details) => {
          if (pending && !next) details.cancel();
          else setOpen(next);
        }}
      >
        <AlertDialog.Trigger render={<Button variant="destructive" />}>
          Delete project
        </AlertDialog.Trigger>
        <AlertDialog.Content aria-busy={pending}>
          <AlertDialog.Header>
            <AlertDialog.Media className="bg-[hsl(var(--ajna-destructive-tint))] text-[hsl(var(--ajna-destructive-text))]">
              <Trash2 aria-hidden="true" />
            </AlertDialog.Media>
            <AlertDialog.Title>
              Delete this project permanently?
            </AlertDialog.Title>
            <AlertDialog.Description>
              This removes the project and its saved settings. This action
              cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={pending}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              variant="destructive"
              loading={pending}
              onClick={() => void removeProject()}
            >
              Delete project
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
      {removed && (
        <p role="status" className="m-0 text-sm">
          Project deleted.
        </p>
      )}
    </div>
  );
}
