"use client";

import { Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationComposition() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
  });
  return (
    <Pagination
      {...pagination}
      totalCount={237}
      onPaginationChange={setPagination}
    >
      <Pagination.Info>
        {({ start, end, totalCount }) =>
          `${start}–${end} of ${totalCount} projects`
        }
      </Pagination.Info>
      <div className="ms-auto flex flex-wrap items-center gap-3">
        <Pagination.Controls pageSelector="input" />
        <Pagination.Separator />
        <Pagination.PageSize label="Projects per page" options={[10, 20, 50]} />
      </div>
    </Pagination>
  );
}
