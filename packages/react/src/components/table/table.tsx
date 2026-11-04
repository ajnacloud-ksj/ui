"use client";

import { cva } from "class-variance-authority";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  forwardRef,
  type MouseEvent,
  type ReactNode,
} from "react";

import { Checkbox, type CheckboxProps } from "@/components/checkbox";
import { cn } from "@/utils";

export type TableLayout = "auto" | "fixed";
export type TableRowVariant = "default" | "selected";
export type TableHeaderVariant = "default" | "compact";
export type TableStickyColumn = "left" | "right";
export type TableSortDirection = false | "asc" | "desc";
export interface TableProps extends ComponentPropsWithoutRef<"table"> {
  layout?: TableLayout;
}
export interface TableHeaderProps extends ComponentPropsWithoutRef<"thead"> {
  variant?: TableHeaderVariant;
  sticky?: boolean;
}
export interface TableHeadProps extends ComponentPropsWithoutRef<"th"> {
  sticky?: TableStickyColumn;
}
export interface TableCellProps extends ComponentPropsWithoutRef<"td"> {
  sticky?: TableStickyColumn;
}
export interface TableRowProps extends ComponentPropsWithoutRef<"tr"> {
  variant?: TableRowVariant;
}
export type TableBodyProps = ComponentPropsWithoutRef<"tbody">;
export type TableFooterProps = ComponentPropsWithoutRef<"tfoot">;
export type TableCaptionProps = ComponentPropsWithoutRef<"caption">;
export interface TableEmptyRowProps extends Omit<TableRowProps, "children"> {
  colSpan: number;
  children: ReactNode;
  cellProps?: Omit<TableCellProps, "children" | "colSpan">;
}
export type TableResizeHandleProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "type"
>;
export interface TableSelectionProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  onCheckedChange?: CheckboxProps["onCheckedChange"];
  /** @deprecated Use onCheckedChange. Preserved from Kumo's Table API. */
  onValueChange?: (checked: boolean) => void;
}
export type TableCheckHeadProps = TableHeadProps & TableSelectionProps;
export type TableCheckCellProps = TableCellProps & TableSelectionProps;
export interface TableSortHeadProps extends TableHeadProps {
  sortDirection: TableSortDirection;
  onSortChange: (
    direction: TableSortDirection,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  disabled?: boolean;
  /** One-based priority for a column participating in multi-column sorting. */
  sortPriority?: number;
  buttonProps?: Omit<
    ComponentPropsWithRef<"button">,
    "type" | "children" | "onClick" | "disabled"
  >;
  /** Renders beside the sort button, keeping resize controls out of the button. */
  resizeHandle?: ReactNode;
}

const layouts = { auto: "table-auto", fixed: "table-fixed" };
const rowVariants = {
  default:
    "bg-ajna-card even:bg-ajna-background [--ajna-table-row-bg:hsl(var(--ajna-card))] even:[--ajna-table-row-bg:hsl(var(--ajna-background))] [&:where(tbody>tr):hover]:bg-ajna-accent [&:where(tbody>tr):hover]:[--ajna-table-row-bg:hsl(var(--ajna-accent))]",
  selected: "bg-ajna-accent [--ajna-table-row-bg:hsl(var(--ajna-accent))]",
};
const rowStyles = cva("box-border", {
  variants: { variant: rowVariants },
  defaultVariants: { variant: "default" },
});

function stickyColumnClasses(
  side: TableStickyColumn,
  element: "head" | "cell",
) {
  const position =
    side === "right"
      ? "sticky right-0 before:-left-6 before:bg-gradient-to-r"
      : "sticky left-0 before:-right-6 before:bg-gradient-to-l";
  const fade =
    "before:pointer-events-none before:absolute before:inset-y-0 before:w-6 before:from-transparent before:content-['']";
  return cn(
    position,
    fade,
    element === "head"
      ? "z-[2] bg-ajna-muted before:to-ajna-muted group-data-[compact]/header:bg-ajna-background group-data-[compact]/header:before:to-ajna-background"
      : "z-[1] bg-[var(--ajna-table-row-bg)] before:to-[var(--ajna-table-row-bg)]",
  );
}

const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  { layout = "auto", className, ...props },
  ref,
) {
  return (
    <table
      {...props}
      ref={ref}
      data-ajna-component="table"
      data-slot="table"
      data-layout={layout}
      className={cn(
        "isolate box-border w-full border-collapse border-spacing-0 bg-ajna-card text-left font-ajna text-sm leading-5 text-ajna-card-foreground [--ajna-table-row-bg:hsl(var(--ajna-card))]",
        layouts[layout],
        className,
      )}
    />
  );
});
TableRoot.displayName = "Table";

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader(
    { variant = "default", sticky = false, className, ...props },
    ref,
  ) {
    return (
      <thead
        {...props}
        ref={ref}
        data-ajna-component="table-header"
        data-slot="table-header"
        data-compact={variant === "compact" ? "" : undefined}
        className={cn(
          "group/header box-border",
          sticky &&
            "[&_th:not([data-sticky])]:z-[1] [&_th]:sticky [&_th]:top-0",
          className,
        )}
      />
    );
  },
);
TableHeader.displayName = "Table.Header";

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ sticky, className, scope = "col", ...props }, ref) {
    const side = sticky === "left" || sticky === "right" ? sticky : undefined;
    return (
      <th
        {...props}
        ref={ref}
        scope={scope}
        data-ajna-component="table-head"
        data-slot="table-head"
        data-sticky={side}
        className={cn(
          "group relative box-border h-10 border-0 border-b border-solid border-ajna-border bg-ajna-muted px-3 py-2 text-start align-middle text-xs font-semibold leading-4 group-data-[compact]/header:h-8 group-data-[compact]/header:bg-ajna-background group-data-[compact]/header:py-1.5",
          side && stickyColumnClasses(side, "head"),
          className,
        )}
      />
    );
  },
);
TableHead.displayName = "Table.Head";

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ variant = "default", className, ...props }, ref) {
    return (
      <tr
        {...props}
        ref={ref}
        data-ajna-component="table-row"
        data-slot="table-row"
        data-variant={variant}
        className={cn(rowStyles({ variant }), className)}
      />
    );
  },
);
TableRow.displayName = "Table.Row";

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody(props, ref) {
    return (
      <tbody
        {...props}
        ref={ref}
        data-ajna-component="table-body"
        data-slot="table-body"
      />
    );
  },
);
TableBody.displayName = "Table.Body";

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ sticky, className, ...props }, ref) {
    const side = sticky === "left" || sticky === "right" ? sticky : undefined;
    return (
      <td
        {...props}
        ref={ref}
        data-ajna-component="table-cell"
        data-slot="table-cell"
        className={cn(
          "box-border px-3 py-3 align-middle text-sm leading-5",
          side && stickyColumnClasses(side, "cell"),
          className,
        )}
      />
    );
  },
);
TableCell.displayName = "Table.Cell";

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  function TableFooter(props, ref) {
    return (
      <tfoot
        {...props}
        ref={ref}
        data-ajna-component="table-footer"
        data-slot="table-footer"
      />
    );
  },
);
TableFooter.displayName = "Table.Footer";

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        {...props}
        ref={ref}
        data-ajna-component="table-caption"
        data-slot="table-caption"
        className={cn(
          "m-0 box-border caption-bottom px-3 py-3 text-start font-ajna text-sm font-normal leading-5 text-ajna-muted-foreground",
          className,
        )}
      />
    );
  },
);
TableCaption.displayName = "Table.Caption";

const TableEmptyRow = forwardRef<HTMLTableRowElement, TableEmptyRowProps>(
  function TableEmptyRow({ colSpan, children, cellProps, ...props }, ref) {
    const span =
      Number.isInteger(colSpan) && colSpan > 0 ? Math.min(colSpan, 1000) : 1;
    return (
      <TableRow {...props} ref={ref}>
        <TableCell
          {...cellProps}
          colSpan={span}
          className={cn(
            "h-32 text-center text-ajna-muted-foreground",
            cellProps?.className,
          )}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  },
);
TableEmptyRow.displayName = "Table.EmptyRow";

const TableResizeHandle = forwardRef<HTMLButtonElement, TableResizeHandleProps>(
  function TableResizeHandle(
    { className, children, "aria-label": label = "Resize column", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        aria-label={label}
        data-ajna-component="table-resize-handle"
        data-slot="table-resize-handle"
        className={cn(
          "absolute right-0 top-0 m-0 box-border flex h-full w-[10px] cursor-col-resize touch-none select-none items-center justify-center border-0 border-solid bg-ajna-card p-0 text-ajna-foreground opacity-0 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
          className,
        )}
      >
        {children ?? (
          <span
            data-ajna-component="table-resize-line"
            aria-hidden="true"
            className="block h-5 w-0.5 rounded bg-ajna-border"
          />
        )}
      </button>
    );
  },
);
TableResizeHandle.displayName = "Table.ResizeHandle";

const TableCheckCell = forwardRef<HTMLTableCellElement, TableCheckCellProps>(
  function TableCheckCell(
    {
      checked,
      indeterminate,
      onCheckedChange,
      onValueChange,
      label = "Select row",
      disabled,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <TableCell
        {...props}
        ref={ref}
        className={cn("w-10 leading-none", className)}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          aria-label={label}
          onCheckedChange={(next, details) => {
            onCheckedChange?.(next, details);
            onValueChange?.(next);
          }}
          className="relative before:absolute before:-inset-3 before:content-['']"
        />
      </TableCell>
    );
  },
);
TableCheckCell.displayName = "Table.CheckCell";

const TableCheckHead = forwardRef<HTMLTableCellElement, TableCheckHeadProps>(
  function TableCheckHead(
    {
      checked,
      indeterminate,
      onCheckedChange,
      onValueChange,
      label = "Select all rows",
      disabled,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <TableHead
        {...props}
        ref={ref}
        className={cn("w-10 leading-none", className)}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          aria-label={label}
          onCheckedChange={(next, details) => {
            onCheckedChange?.(next, details);
            onValueChange?.(next);
          }}
          className="relative before:absolute before:-inset-x-3 before:-inset-y-2 before:content-['']"
        />
      </TableHead>
    );
  },
);
TableCheckHead.displayName = "Table.CheckHead";

const TableSortHead = forwardRef<HTMLTableCellElement, TableSortHeadProps>(
  function TableSortHead(
    {
      sortDirection,
      onSortChange,
      sortPriority,
      disabled,
      buttonProps,
      resizeHandle,
      children,
      ...props
    },
    ref,
  ) {
    const direction =
      sortDirection === "asc" || sortDirection === "desc"
        ? sortDirection
        : false;
    const Icon =
      direction === "asc"
        ? ArrowUp
        : direction === "desc"
          ? ArrowDown
          : ChevronsUpDown;
    const { className: buttonClassName, ...sortButtonProps } =
      buttonProps ?? {};
    const priority =
      direction &&
      typeof sortPriority === "number" &&
      Number.isInteger(sortPriority) &&
      sortPriority > 0
        ? sortPriority
        : undefined;
    return (
      <TableHead
        aria-sort={
          direction === "asc"
            ? "ascending"
            : direction === "desc"
              ? "descending"
              : "none"
        }
        {...props}
        ref={ref}
      >
        <button
          {...sortButtonProps}
          type="button"
          disabled={disabled}
          data-ajna-component="table-sort-button"
          data-slot="table-sort-button"
          onClick={(event) => {
            if (!event.defaultPrevented)
              onSortChange(
                direction === false
                  ? "asc"
                  : direction === "asc"
                    ? "desc"
                    : false,
                event,
              );
          }}
          className={cn(
            "m-0 -my-1 -ms-1.5 box-border inline-flex cursor-pointer items-center gap-1 rounded-ajna-md border-0 border-solid bg-transparent px-1.5 py-1 text-start align-middle font-ajna font-semibold leading-[inherit] text-inherit outline-none transition-colors [font-size:inherit] hover:bg-ajna-accent hover:text-ajna-primary focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
            buttonClassName,
          )}
        >
          <span data-ajna-component="table-sort-label">{children}</span>
          <Icon
            data-ajna-component="table-sort-icon"
            aria-hidden="true"
            focusable="false"
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              direction ? "text-ajna-primary" : "opacity-40",
            )}
          />
          {priority !== undefined && (
            <>
              {" "}
              <span
                data-ajna-component="table-sort-priority"
                className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-ajna-sm bg-ajna-muted px-0.5 text-[10px] font-semibold leading-none text-ajna-muted-foreground"
              >
                <span aria-hidden="true">{priority}</span>
                <span
                  data-ajna-component="table-sort-priority-label"
                  className="sr-only"
                >
                  Sort priority {priority}
                </span>
              </span>
            </>
          )}
        </button>
        {resizeHandle}
      </TableHead>
    );
  },
);
TableSortHead.displayName = "Table.SortHead";

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Footer: TableFooter,
  Caption: TableCaption,
  EmptyRow: TableEmptyRow,
  CheckHead: TableCheckHead,
  CheckCell: TableCheckCell,
  ResizeHandle: TableResizeHandle,
  SortHead: TableSortHead,
});
