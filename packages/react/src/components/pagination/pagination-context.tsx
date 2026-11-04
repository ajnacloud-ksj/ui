"use client";

import { createContext, useContext } from "react";

import type {
  PaginationInfoState,
  PaginationLabels,
  PaginationState,
} from "./pagination.types";

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const defaultLabels: PaginationLabels = {
  navigation: "Pagination",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  pageNumber: "Page number",
  pageSize: "Items per page",
  pageStatus: (page, pageCount) =>
    pageCount === undefined ? `Page ${page}` : `Page ${page} of ${pageCount}`,
  range: ({ start, end, totalCount }) => (
    <>
      Showing{" "}
      <span
        data-ajna-component="pagination-range"
        className="font-medium tabular-nums text-ajna-foreground"
      >
        {start}–{end}
      </span>
      {totalCount !== undefined && (
        <>
          {" "}
          of{" "}
          <span
            data-ajna-component="pagination-total"
            className="font-medium tabular-nums text-ajna-foreground"
          >
            {totalCount}
          </span>
        </>
      )}
    </>
  ),
};
interface PaginationContextValue {
  info: PaginationInfoState;
  hasRange: boolean;
  canPrevious: boolean;
  canNext: boolean;
  disabled: boolean;
  labels: PaginationLabels;
  pageSizeOptions: readonly number[];
  change: (next: PaginationState) => void;
}
export const PaginationContext = createContext<PaginationContextValue | null>(
  null,
);
export function usePaginationContext() {
  const context = useContext(PaginationContext);
  if (!context)
    throw new Error("Pagination parts must be rendered inside Pagination.");
  return context;
}
