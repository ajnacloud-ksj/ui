"use client";

import { AlertDialog, Button } from "@ajnacloud/ui";
import { Bluetooth } from "lucide-react";
import { useState } from "react";

export function AlertDialogSmall() {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={<Button variant="outline" />}>
        Pair device
      </AlertDialog.Trigger>
      <AlertDialog.Content size="sm">
        <AlertDialog.Header>
          <AlertDialog.Media>
            <Bluetooth aria-hidden="true" />
          </AlertDialog.Media>
          <AlertDialog.Title>Pair this device?</AlertDialog.Title>
          <AlertDialog.Description>
            Allow this device to connect to your workspace.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={() => setOpen(false)}>
            Pair device
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
