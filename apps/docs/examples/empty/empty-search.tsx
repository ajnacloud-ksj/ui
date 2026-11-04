"use client";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
} from "@ajnacloud/ui";
import { Search } from "lucide-react";
import { useState } from "react";

export function EmptySearch() {
  const [query, setQuery] = useState("archived");
  return (
    <div style={{ width: "100%" }}>
      <Input
        aria-label="Search projects"
        value={query}
        onValueChange={setQuery}
      />
      {query ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" aria-hidden="true">
              <Search />
            </EmptyMedia>
            <EmptyTitle render={<h3>No matching projects</h3>} />
            <EmptyDescription>
              No projects match “{query}”. Try another name or clear your
              search.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <p role="status">Showing all projects.</p>
      )}
    </div>
  );
}
