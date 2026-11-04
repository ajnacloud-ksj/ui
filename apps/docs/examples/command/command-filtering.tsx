"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ajnacloud/ui";
import { useState } from "react";

export function CommandFiltering() {
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("system");
  const themes = [
    { value: "system", label: "System", keywords: ["automatic", "device"] },
    { value: "light", label: "Light", keywords: ["day", "bright"] },
    { value: "dark", label: "Dark", keywords: ["night", "dim"] },
  ];
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Command label="Choose a theme" className="border border-ajna-border">
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Try searching for night..."
        />
        <CommandList>
          <CommandEmpty>No themes found.</CommandEmpty>
          <CommandGroup heading="Appearance">
            {themes.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                keywords={item.keywords}
                data-checked={theme === item.value}
                onSelect={setTheme}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="m-0 text-sm" role="status">
        Theme: {theme}. Search: {search || "empty"}.
      </p>
    </div>
  );
}
