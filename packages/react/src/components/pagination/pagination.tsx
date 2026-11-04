"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { forwardRef } from "react";

import { cn } from "@/utils";

import type {
  PaginationProps,
  PaginationSeparatorProps,
} from "./pagination.types";
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  defaultLabels,
  PaginationContext,
} from "./pagination-context";
import { PaginationControls } from "./pagination-controls";
import { PaginationInfo } from "./pagination-info";
import {
  paginationInfo,
  requestedPage,
  validateCount,
} from "./pagination-model";
import { PaginationPageSize } from "./pagination-page-size";

export const PaginationSeparator = forwardRef<
  HTMLDivElement,
  PaginationSeparatorProps
>(function PaginationSeparator({ className, ...props }, ref) {
  return (
    <div
      aria-hidden="true"
      {...props}
      ref={ref}
      data-ajna-component="pagination-separator"
      data-slot="pagination-separator"
      className={cn(
        "mx-1 box-border h-5 w-px shrink-0 bg-ajna-border",
        className,
      )}
    />
  );
});

const PaginationRoot = forwardRef<HTMLDivElement, PaginationProps>(
  function PaginationRoot(
    {
      page,
      pageSize = 20,
      onPaginationChange,
      totalCount,
      hasNextPage = false,
      itemCount,
      disabled = false,
      controls = "full",
      pageSelector = "text",
      showPageSize = false,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      labels: labelOverrides,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const direction = useDirection();
    const info = paginationInfo({ page, pageSize, totalCount, itemCount });
    const labels = { ...defaultLabels, ...labelOverrides };
    const context = {
      info,
      hasRange: totalCount !== undefined || itemCount !== undefined,
      canPrevious: !disabled && totalCount !== 0 && page > 1,
      canNext:
        !disabled &&
        (info.pageCount === undefined ? hasNextPage : page < info.pageCount),
      disabled,
      labels,
      pageSizeOptions,
      change(next: { page: number; pageSize: number }) {
        if (disabled) return;
        validateCount(next.page, "page", 1);
        validateCount(next.pageSize, "pageSize", 1);
        const pageCount =
          totalCount === undefined
            ? undefined
            : Math.max(1, Math.ceil(totalCount / next.pageSize));
        const nextPage = requestedPage(next.page, pageCount);
        if (nextPage !== page || next.pageSize !== pageSize)
          onPaginationChange({ page: nextPage, pageSize: next.pageSize });
      },
    };
    return (
      <PaginationContext.Provider value={context}>
        <div
          dir={direction}
          {...props}
          ref={ref}
          data-ajna-component="pagination"
          data-slot="pagination"
          className={cn(
            "box-border flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 font-ajna text-sm leading-5 text-ajna-foreground",
            className,
          )}
        >
          {children === undefined ? (
            <>
              <PaginationInfo />
              <div
                data-ajna-component="pagination-actions"
                className="ms-auto flex flex-wrap items-center gap-3"
              >
                {showPageSize && (
                  <>
                    <PaginationPageSize />
                    <PaginationSeparator />
                  </>
                )}
                <PaginationControls
                  controls={controls}
                  pageSelector={pageSelector}
                />
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </PaginationContext.Provider>
    );
  },
);

export const Pagination = Object.assign(PaginationRoot, {
  Info: PaginationInfo,
  PageSize: PaginationPageSize,
  Controls: PaginationControls,
  Separator: PaginationSeparator,
});
