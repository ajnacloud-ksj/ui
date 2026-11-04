"use client";

import { ScrollArea } from "@ajnacloud/ui";

export function ScrollAreaHorizontal() {
  const projects = [
    "Website redesign",
    "Component library",
    "Customer portal",
    "Data pipeline",
    "Release planning",
  ];
  return (
    <ScrollArea
      orientation="horizontal"
      style={{ width: "min(100%, 480px)" }}
      className="rounded-lg border border-[hsl(var(--ajna-border))]"
      viewportProps={{ role: "region", "aria-label": "Projects" }}
    >
      <div className="flex w-max gap-3 p-4">
        {projects.map((project, index) => (
          <article
            key={project}
            className="flex h-32 w-48 shrink-0 flex-col justify-end rounded-md border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-muted))] p-3"
          >
            <p className="text-xs text-[hsl(var(--ajna-muted-foreground))]">
              Project {index + 1}
            </p>
            <h3 className="mt-1 text-sm font-medium">{project}</h3>
          </article>
        ))}
      </div>
    </ScrollArea>
  );
}
