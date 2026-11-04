"use client";

import { Button, Pagination, type PaginationState } from "@ajnacloud/ui";
import { useState } from "react";

export function PaginationDisabled() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 2,
    pageSize: 20,
  });
  const [disabled, setDisabled] = useState(true);
  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setDisabled((value) => !value)}>
        {disabled ? "Enable controls" : "Disable controls"}
      </Button>
      <Pagination
        {...pagination}
        totalCount={237}
        onPaginationChange={setPagination}
        disabled={disabled}
        aria-busy={disabled}
        showPageSize
        pageSelector="input"
      />
    </div>
  );
}
