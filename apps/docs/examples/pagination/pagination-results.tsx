"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationResults() {
  const projects = Array.from({ length: 47 }, (_, index) => ({
    id: index + 1,
    name: `Project ${index + 1}`,
  }));
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });
  const [filtered, setFiltered] = useState(false);
  const matches = filtered
    ? projects.filter((project) => project.id % 2 === 0)
    : projects;
  const start = (pagination.page - 1) * pagination.pageSize;
  const rows = matches.slice(start, start + pagination.pageSize);
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filtered}
          onChange={(event) => {
            setFiltered(event.target.checked);
            setPagination((value) => ({ ...value, page: 1 }));
          }}
        />
        Only even-numbered projects
      </label>
      <ul className="m-0 list-none space-y-1 p-0 text-sm">
        {rows.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
      <Pagination
        {...pagination}
        totalCount={matches.length}
        onPaginationChange={setPagination}
        showPageSize
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
