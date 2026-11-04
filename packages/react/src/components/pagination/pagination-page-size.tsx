"use client";

import { forwardRef, useId } from "react";

import { Select } from "@/components/select";
import { cn } from "@/utils";

import type { PaginationPageSizeProps } from "./pagination.types";
import { usePaginationContext } from "./pagination-context";
import { validateCount } from "./pagination-model";

export const PaginationPageSize = forwardRef<
  HTMLDivElement,
  PaginationPageSizeProps
>(function PaginationPageSize(
  { options, label, className, contentProps, ...props },
  ref,
) {
  const { info, change, pageSizeOptions, disabled, labels } =
    usePaginationContext();
  const id = useId();
  const sizes = [...new Set(options ?? pageSizeOptions)];
  const visibleLabel = label === undefined ? labels.pageSize : label;
  for (const size of sizes) validateCount(size, "page size option", 1);
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="pagination-page-size"
      data-slot="pagination-page-size"
      className={cn(
        "box-border inline-flex shrink-0 items-center gap-2 font-ajna text-sm leading-5 text-ajna-muted-foreground",
        className,
      )}
    >
      {visibleLabel && <label htmlFor={id}>{visibleLabel}</label>}
      <Select
        id={id}
        aria-label={
          typeof visibleLabel === "string" ? visibleLabel : labels.pageSize
        }
        options={sizes.map((size) => ({ label: String(size), value: size }))}
        value={info.pageSize}
        onValueChange={(value) => {
          if (value !== null && value !== info.pageSize)
            change({ page: 1, pageSize: value });
        }}
        size="sm"
        disabled={disabled}
        className="w-20"
        contentProps={{
          alignItemWithTrigger: false,
          align: "end",
          ...contentProps,
        }}
      />
    </div>
  );
});
