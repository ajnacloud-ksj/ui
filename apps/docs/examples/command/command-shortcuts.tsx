"use client";

import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@ajnacloud/ui";
import { useState } from "react";

export function CommandShortcuts() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const actions = [
    { value: "Profile", shortcut: "⌘P" },
    { value: "Billing", shortcut: "⌘B" },
    { value: "Settings", shortcut: "⌘S" },
  ];
  return (
    <div className="grid gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command label="Search settings">
          <CommandInput placeholder="Search settings..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Settings">
              {actions.map((action) => (
                <CommandItem
                  key={action.value}
                  value={action.value}
                  onSelect={() => {
                    setSelected(action.value);
                    setOpen(false);
                  }}
                >
                  {action.value}
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
      <p className="m-0 text-sm" role="status">
        {selected
          ? `Selected: ${selected}`
          : "Shortcut hints appear beside commands."}
      </p>
    </div>
  );
}
