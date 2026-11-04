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
} from "@ajnacloud/ui";
import { useState } from "react";

export function CommandBasic() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const actions = ["Calendar", "Search Emoji", "Calculator"];
  return (
    <div className="grid gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command label="Search commands">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {actions.map((action) => (
                <CommandItem
                  key={action}
                  value={action}
                  onSelect={() => {
                    setSelected(action);
                    setOpen(false);
                  }}
                >
                  {action}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
      <p className="m-0 text-sm" role="status">
        {selected ? `Selected: ${selected}` : "Choose a command."}
      </p>
    </div>
  );
}
