"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationPageSizeExample() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 3,
    pageSize: 20,
  });
  return (
    <Pagination
      {...pagination}
      totalCount={237}
      onPaginationChange={setPagination}
      showPageSize
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
