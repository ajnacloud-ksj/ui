"use client";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ajnacloud/ui";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

export function EmptyExample() {
  const [created, setCreated] = useState(false);
  if (created)
    return (
      <div role="status">
        Your first project is ready.{" "}
        <Button variant="secondary" onClick={() => setCreated(false)}>
          Reset example
        </Button>
      </div>
    );
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle render={<h3>No projects yet</h3>} />
        <EmptyDescription>
          Create a project to keep your work in one place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="primary" onClick={() => setCreated(true)}>
          Create project
        </Button>
      </EmptyContent>
    </Empty>
  );
}
