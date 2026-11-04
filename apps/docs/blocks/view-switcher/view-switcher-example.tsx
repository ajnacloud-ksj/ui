"use client";

import { Badge, Card, CardContent } from "@ajnacloud/ui";
import { FileText } from "lucide-react";
import { useState } from "react";

import { ViewSwitcher, type ViewSwitcherValue } from "./view-switcher";

const documents = [
  {
    title: "Inventory report",
    category: "Operations",
    updated: "Oct 24, 2026",
  },
  {
    title: "Supplier directory",
    category: "Purchasing",
    updated: "Oct 22, 2026",
  },
  { title: "Care guidelines", category: "Operations", updated: "Oct 20, 2026" },
];

export function ViewSwitcherExample() {
  const [view, setView] = useState<ViewSwitcherValue>("table");
  return (
    <section
      className="mx-auto max-w-4xl space-y-6 px-5 py-8 sm:px-8"
      aria-label="Document views"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-ajna-muted-foreground">
            Workspace reports and references.
          </p>
        </div>
        <ViewSwitcher
          value={view}
          onValueChange={setView}
          aria-label="Document view"
        />
      </div>
      <div
        className={
          view === "grid" ? "grid gap-4 sm:grid-cols-3" : "flex flex-col gap-3"
        }
      >
        {documents.map((document) => (
          <Card key={document.title} size="sm">
            <CardContent
              className={
                view === "grid"
                  ? "flex flex-col gap-5"
                  : "flex items-center gap-4"
              }
            >
              <FileText
                aria-hidden="true"
                className="size-5 shrink-0 text-ajna-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium">{document.title}</h2>
                <p className="mt-1 text-xs text-ajna-muted-foreground">
                  Updated {document.updated}
                </p>
              </div>
              <Badge variant="outline" className="w-fit">
                {document.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
