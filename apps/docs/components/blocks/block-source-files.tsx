"use client";

import { Select } from "@ajnacloud/ui";
import { type ReactNode, useId, useState } from "react";

export function BlockSourceFiles({
  files,
}: {
  files: { path: string; content: ReactNode }[];
}) {
  const id = useId();
  const [path, setPath] = useState(files[0]?.path);
  const selected = files.find((file) => file.path === path) ?? files[0];
  if (!selected) return null;

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex min-w-0 items-center gap-3 border-b border-fd-border px-4 py-3">
        <label
          htmlFor={id}
          className="shrink-0 text-sm text-fd-muted-foreground"
        >
          File
        </label>
        <Select
          id={id}
          aria-label="Source file"
          options={files}
          getLabel={(file) => file.path}
          getValue={(file) => file.path}
          value={selected.path}
          onValueChange={(value) => {
            if (value !== null) setPath(value);
          }}
          className="flex-1"
          contentProps={{ alignItemWithTrigger: false }}
        />
      </div>
      <div key={selected.path} className="min-w-0">
        {selected.content}
      </div>
    </div>
  );
}
