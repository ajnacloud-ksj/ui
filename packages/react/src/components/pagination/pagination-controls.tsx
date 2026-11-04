"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { forwardRef, useState } from "react";

import { Button } from "@/components/button";
import { ButtonGroup, ButtonGroupText } from "@/components/button-group";
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "@/components/input-group";
import { cn } from "@/utils";

import type { PaginationControlsProps } from "./pagination.types";
import { usePaginationContext } from "./pagination-context";
import { parsePage } from "./pagination-model";

export const PaginationControls = forwardRef<
  HTMLElement,
  PaginationControlsProps
>(function PaginationControls(
  { controls = "full", pageSelector = "text", className, ...props },
  ref,
) {
  const { info, canPrevious, canNext, disabled, change, labels } =
    usePaginationContext();
  const { page, pageSize, pageCount } = info;
  const direction = useDirection();
  const [draft, setDraft] = useState({
    page,
    text: String(page),
    dirty: false,
  });
  if (draft.page !== page) setDraft({ page, text: String(page), dirty: false });
  const full = controls !== "simple" && pageCount !== undefined;
  const Prev = direction === "rtl" ? ChevronRight : ChevronLeft;
  const Next = direction === "rtl" ? ChevronLeft : ChevronRight;
  const First = direction === "rtl" ? ChevronsRight : ChevronsLeft;
  const Last = direction === "rtl" ? ChevronsLeft : ChevronsRight;
  function navigate(next: number) {
    setDraft({ page, text: String(page), dirty: false });
    change({ page: next, pageSize });
  }
  function commit() {
    if (!draft.dirty || pageCount === undefined) return;
    const next = parsePage(draft.text, pageCount);
    setDraft({ page, text: String(page), dirty: false });
    if (next !== null) change({ page: next, pageSize });
  }
  return (
    <nav
      aria-label={labels.navigation}
      dir={direction}
      {...props}
      ref={ref}
      data-ajna-component="pagination-controls"
      data-slot="pagination-controls"
      className={cn(
        "box-border inline-flex shrink-0 items-center font-ajna",
        className,
      )}
    >
      <ButtonGroup>
        {full && (
          <Button
            aria-label={labels.firstPage}
            variant="outline"
            shape="square"
            className="h-8 w-8"
            disabled={!canPrevious}
            onClick={() => navigate(1)}
          >
            <First size={16} aria-hidden="true" />
          </Button>
        )}
        <Button
          aria-label={labels.previousPage}
          variant="outline"
          shape="square"
          className="h-8 w-8"
          disabled={!canPrevious}
          onClick={() => navigate(page - 1)}
        >
          <Prev size={16} aria-hidden="true" />
        </Button>
        {full && pageSelector === "input" ? (
          <InputGroup className="min-h-8 w-auto">
            <InputGroupInput
              aria-label={labels.pageNumber}
              value={draft.text}
              onValueChange={(text) => setDraft({ page, text, dirty: true })}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  commit();
                }
              }}
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled}
              className="h-[1.875rem] w-12 flex-none px-1 text-center tabular-nums"
            />
            <InputGroupText className="shrink-0 justify-end pe-2 text-xs tabular-nums">
              / {pageCount}
            </InputGroupText>
          </InputGroup>
        ) : (
          <ButtonGroupText className="min-h-8 whitespace-nowrap bg-ajna-background px-3 font-normal tabular-nums">
            {labels.pageStatus(page, pageCount)}
          </ButtonGroupText>
        )}
        <Button
          aria-label={labels.nextPage}
          variant="outline"
          shape="square"
          className="h-8 w-8"
          disabled={!canNext}
          onClick={() => navigate(page + 1)}
        >
          <Next size={16} aria-hidden="true" />
        </Button>
        {full && (
          <Button
            aria-label={labels.lastPage}
            variant="outline"
            shape="square"
            className="h-8 w-8"
            disabled={!canNext}
            onClick={() => navigate(pageCount!)}
          >
            <Last size={16} aria-hidden="true" />
          </Button>
        )}
      </ButtonGroup>
    </nav>
  );
});
