"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationInputExample() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 4,
    pageSize: 20,
  });
  return (
    <Pagination
      {...pagination}
      totalCount={1000}
      onPaginationChange={setPagination}
      pageSelector="input"
    />
  );
}
