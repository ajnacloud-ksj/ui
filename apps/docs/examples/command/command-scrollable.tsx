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

export function CommandScrollable() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const projects = Array.from(
    { length: 40 },
    (_, index) => `Project ${String(index + 1).padStart(2, "0")}`,
  );
  return (
    <div className="grid gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Menu
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Switch project"
        description="Search your projects and choose one."
        showCloseButton
      >
        <Command label="Search projects">
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project}
                  value={project}
                  onSelect={() => {
                    setSelected(project);
                    setOpen(false);
                  }}
                >
                  {project}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
      <p className="m-0 text-sm" role="status">
        {selected
          ? `Selected: ${selected}`
          : "Use arrow keys or scroll to browse."}
      </p>
    </div>
  );
}
