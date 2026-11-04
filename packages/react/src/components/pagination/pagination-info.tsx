"use client";

import { forwardRef } from "react";

import { cn } from "@/utils";

import type { PaginationInfoProps } from "./pagination.types";
import { usePaginationContext } from "./pagination-context";

export const PaginationInfo = forwardRef<HTMLDivElement, PaginationInfoProps>(
  function PaginationInfo({ children, className, ...props }, ref) {
    const { info, hasRange, labels } = usePaginationContext();
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        {...props}
        ref={ref}
        data-ajna-component="pagination-info"
        data-slot="pagination-info"
        className={cn(
          "box-border min-w-0 font-ajna text-sm leading-5 text-ajna-muted-foreground",
          className,
        )}
      >
        {children ? children(info) : hasRange ? labels.range(info) : null}
      </div>
    );
  },
);
