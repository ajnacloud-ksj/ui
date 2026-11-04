"use client";

import { CopyButton, FilterBar } from "@ajnacloud/ui";
import { Archive, Users } from "lucide-react";
import { useState } from "react";

export function FilterBarBasic() {
  type Values = { status: string | null; owners: string[]; archived: boolean };
  const resetValue: Values = { status: null, owners: [], archived: false };
  const [value, setValue] = useState(resetValue);
  const [search, setSearch] = useState("");
  const projects = [
    {
      name: "Website redesign",
      status: "active",
      owner: "alex",
      archived: false,
    },
    {
      name: "Customer portal",
      status: "paused",
      owner: "sam",
      archived: false,
    },
    {
      name: "Component library",
      status: "active",
      owner: "sam",
      archived: false,
    },
    {
      name: "Legacy dashboard",
      status: "paused",
      owner: "alex",
      archived: true,
    },
  ];
  const visible = projects.filter(
    (project) =>
      (value.archived || !project.archived) &&
      (value.status === null || project.status === value.status) &&
      (value.owners.length === 0 || value.owners.includes(project.owner)) &&
      project.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="w-full space-y-5">
      <FilterBar
        value={value}
        resetValue={resetValue}
        onValueChange={setValue}
        search={{
          value: search,
          onValueChange: setSearch,
          placeholder: "Search projects…",
          "aria-label": "Search projects",
        }}
        actions={
          <CopyButton value={JSON.stringify(value)} copyLabel="Copy filters" />
        }
        filters={[
          {
            id: "status",
            type: "select",
            label: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
          {
            id: "owners",
            type: "multi-select",
            label: "Owners",
            icon: <Users />,
            searchable: true,
            options: [
              { label: "Alex Morgan", value: "alex", count: 2 },
              { label: "Sam Lee", value: "sam", count: 2 },
            ],
          },
          {
            id: "archived",
            type: "toggle",
            label: "Include archived",
            icon: <Archive />,
          },
        ]}
      />
      <p
        role="status"
        className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
      >
        {visible.length} matching projects
      </p>
      <ul className="m-0 list-none divide-y divide-[hsl(var(--ajna-border))] p-0">
        {visible.map((project) => (
          <li
            key={project.name}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <span>{project.name}</span>
            <span className="text-[hsl(var(--ajna-muted-foreground))]">
              {project.status}
            </span>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="text-sm text-[hsl(var(--ajna-muted-foreground))]">
          No projects match these filters.
        </p>
      )}
    </div>
  );
}
