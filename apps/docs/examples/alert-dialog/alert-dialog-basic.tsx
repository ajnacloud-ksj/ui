"use client";

import { AlertDialog, Button } from "@ajnacloud/ui";
import { useState } from "react";

export function AlertDialogBasic() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="space-y-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger render={<Button variant="outline" />}>
          Archive project
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Archive this project?</AlertDialog.Title>
            <AlertDialog.Description>
              The project will leave your active list. You can restore it later.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                setConfirmed(true);
                setOpen(false);
              }}
            >
              Archive project
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
      {confirmed && (
        <p role="status" className="m-0 text-sm">
          Project archived.
        </p>
      )}
    </div>
  );
}
