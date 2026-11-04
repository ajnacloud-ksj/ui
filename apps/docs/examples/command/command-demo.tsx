"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ajnacloud/ui";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

export function CommandDemo() {
  return (
    <Command
      label="Quick actions"
      className="max-w-sm border border-ajna-border"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar">
            <Calendar aria-hidden="true" />
            Calendar
          </CommandItem>
          <CommandItem value="emoji">
            <Smile aria-hidden="true" />
            Search Emoji
          </CommandItem>
          <CommandItem value="calculator" disabled>
            <Calculator aria-hidden="true" />
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile">
            <User aria-hidden="true" />
            Profile<CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem value="billing">
            <CreditCard aria-hidden="true" />
            Billing<CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem value="settings">
            <Settings aria-hidden="true" />
            Settings<CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
