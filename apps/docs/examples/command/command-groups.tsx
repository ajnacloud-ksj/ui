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
  CommandSeparator,
} from "@ajnacloud/ui";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";
import { useState } from "react";

export function CommandGroups() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const select = (value: string) => {
    setSelected(value);
    setOpen(false);
  };
  return (
    <div className="grid gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command label="Search all commands">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" onSelect={select}>
                <Calendar aria-hidden="true" />
                Calendar
              </CommandItem>
              <CommandItem value="emoji" onSelect={select}>
                <Smile aria-hidden="true" />
                Search Emoji
              </CommandItem>
              <CommandItem value="calculator" onSelect={select}>
                <Calculator aria-hidden="true" />
                Calculator
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem value="profile" onSelect={select}>
                <User aria-hidden="true" />
                Profile
              </CommandItem>
              <CommandItem value="billing" onSelect={select}>
                <CreditCard aria-hidden="true" />
                Billing
              </CommandItem>
              <CommandItem value="settings" onSelect={select}>
                <Settings aria-hidden="true" />
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
      <p className="m-0 text-sm" role="status">
        {selected ? `Selected: ${selected}` : "Search across both groups."}
      </p>
    </div>
  );
}
