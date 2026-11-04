"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationUnknown() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
  });
  const available = 47;
  const itemCount = Math.min(
    pagination.pageSize,
    Math.max(0, available - (pagination.page - 1) * pagination.pageSize),
  );
  const hasNextPage = pagination.page * pagination.pageSize < available;
  return (
    <div className="space-y-3">
      <Pagination
        {...pagination}
        onPaginationChange={setPagination}
        hasNextPage={hasNextPage}
        itemCount={itemCount}
      />
      <p className="m-0 text-sm opacity-70">
        This feed does not provide a total count.
      </p>
    </div>
  );
}
