"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationSimple() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
  });
  return (
    <Pagination
      {...pagination}
      totalCount={237}
      onPaginationChange={setPagination}
      controls="simple"
    />
  );
}
