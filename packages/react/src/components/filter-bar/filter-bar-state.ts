import { type DateValue, getLocalTimeZone } from "@internationalized/date";
import type { ReactNode, RefObject } from "react";

import type { DateInputProps } from "@/components/date-input";
import type { InputProps } from "@/components/input";
import type { NumberInputProps } from "@/components/number-input";

import type {
  FilterBarCustomRenderProps,
  FilterBarDateRange,
  FilterBarMessages,
  FilterBarNumberRange,
  FilterBarOption,
  FilterBarOptionValue,
} from "./filter-bar.types";

// The public mapped union checks each field before its heterogeneous values reach rendering.
export interface RuntimeFilter {
  id: string;
  type:
    | "toggle"
    | "select"
    | "multi-select"
    | "text"
    | "number-range"
    | "date"
    | "date-range"
    | "custom";
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  options?: readonly FilterBarOption<FilterBarOptionValue>[];
  placeholder?: string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  getMissingLabel?: (value: FilterBarOptionValue) => string;
  isEqual?: (value: unknown, other: unknown) => boolean;
  isActive?: (value: unknown, resetValue: unknown) => boolean;
  getActiveLabel?: (value: unknown) => ReactNode;
  validate?: (value: unknown) => string | null | undefined;
  render?: (props: FilterBarCustomRenderProps<unknown>) => ReactNode;
  inputProps?: InputProps;
  numberProps?: Pick<
    NumberInputProps,
    "min" | "max" | "step" | "format" | "locale" | "suffix" | "showControls"
  >;
  dateProps?: DateInputProps;
}
export type RuntimeValues = Record<string, unknown>;
export interface FieldContext {
  filter: RuntimeFilter;
  value: unknown;
  resetValue: unknown;
  onValueChange: (value: unknown) => void;
  disabled: boolean;
  id: string;
  locale: string;
  messages: FilterBarMessages;
  className?: string;
  popupContainer: RefObject<HTMLDivElement | null>;
}
export const defaultMessages: FilterBarMessages = {
  filters: "Filters",
  listControls: "List controls",
  activeFilters: "Active filters",
  filterOptions: "Filter options",
  clearAll: "Clear filters",
  clearField: "Reset",
  apply: "Apply",
  cancel: "Cancel",
  done: "Done",
  close: "Close filters",
  instantDescription: "Results update as you change filters.",
  stagedDescription: "Choose your filters, then apply them together.",
  search: "Search…",
  loading: "Loading options",
  emptyOptions: "No options available.",
  minimum: "Minimum",
  maximum: "Maximum",
  startDate: "Start date",
  endDate: "End date",
  invalidRange: "The start must not be greater than the end.",
  invalidValue: "Check this filter's value.",
  removeFilter: (label) => `Remove ${label} filter`,
  activeCount: (count) =>
    `${count} active ${count === 1 ? "filter" : "filters"}`,
  selectedCount: (count) => `${count} selected`,
  overflowCount: (count) => `+${count}`,
  selection: (labels) =>
    labels.length > 1
      ? `${labels[0]} +${labels.length - 1}`
      : (labels[0] ?? ""),
  range: (start, end) =>
    start !== null && end !== null
      ? `${start}–${end}`
      : start !== null
        ? `≥ ${start}`
        : end !== null
          ? `≤ ${end}`
          : "",
};
function sameDate(left: DateValue | null, right: DateValue | null) {
  return (
    left === right ||
    (left !== null &&
      right !== null &&
      left.calendar.identifier === right.calendar.identifier &&
      left.toString() === right.toString())
  );
}
export function valuesEqual(
  filter: RuntimeFilter,
  left: unknown,
  right: unknown,
): boolean {
  if (filter.isEqual) return filter.isEqual(left, right);
  if (Object.is(left, right)) return true;
  switch (filter.type) {
    case "multi-select": {
      const a = new Set(left as FilterBarOptionValue[]);
      const b = new Set(right as FilterBarOptionValue[]);
      return a.size === b.size && [...a].every((value) => b.has(value));
    }
    case "number-range": {
      const a = left as FilterBarNumberRange;
      const b = right as FilterBarNumberRange;
      return a.min === b.min && a.max === b.max;
    }
    case "date":
      return sameDate(left as DateValue | null, right as DateValue | null);
    case "date-range": {
      const a = left as FilterBarDateRange;
      const b = right as FilterBarDateRange;
      return sameDate(a.start, b.start) && sameDate(a.end, b.end);
    }
    default:
      return false;
  }
}
export function getError(
  filter: RuntimeFilter,
  value: unknown,
  messages: FilterBarMessages,
): string | undefined {
  if (filter.type === "number-range") {
    const { min, max } = value as FilterBarNumberRange;
    if (min !== null && max !== null && min > max) return messages.invalidRange;
    if (
      [min, max].some(
        (number) =>
          number !== null &&
          (!Number.isFinite(number) ||
            (filter.numberProps?.min !== undefined &&
              number < filter.numberProps.min) ||
            (filter.numberProps?.max !== undefined &&
              number > filter.numberProps.max)),
      )
    )
      return messages.invalidValue;
  }
  const dates =
    filter.type === "date"
      ? [value as DateValue | null]
      : filter.type === "date-range"
        ? [
            (value as FilterBarDateRange).start,
            (value as FilterBarDateRange).end,
          ]
        : [];
  if (
    filter.type === "date-range" &&
    dates[0] &&
    dates[1] &&
    dates[0].compare(dates[1]) > 0
  )
    return messages.invalidRange;
  if (
    dates.some(
      (date) =>
        date !== null &&
        ((filter.dateProps?.minValue &&
          date.compare(filter.dateProps.minValue) < 0) ||
          (filter.dateProps?.maxValue &&
            date.compare(filter.dateProps.maxValue) > 0) ||
          filter.dateProps?.isDateUnavailable?.(date)),
    )
  )
    return messages.invalidValue;
  return filter.validate?.(value) ?? undefined;
}
export function optionLabel(
  filter: RuntimeFilter,
  value: FilterBarOptionValue,
): string {
  return (
    filter.options?.find((option) => option.value === value)?.label ??
    filter.getMissingLabel?.(value) ??
    String(value)
  );
}
export function activeLabel(
  filter: RuntimeFilter,
  value: unknown,
  messages: FilterBarMessages,
  locale: string,
  formatDate?: (value: DateValue) => string,
): ReactNode {
  if (filter.getActiveLabel) return filter.getActiveLabel(value);
  const dateLabel =
    formatDate ??
    ((date: DateValue) => {
      const timeZone = "timeZone" in date ? date.timeZone : getLocalTimeZone();
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        calendar: date.calendar.identifier,
        timeZone,
      }).format(date.toDate(timeZone));
    });
  let label: string;
  switch (filter.type) {
    case "select":
      label =
        value === null
          ? ""
          : optionLabel(filter, value as FilterBarOptionValue);
      break;
    case "multi-select":
      label = messages.selection(
        (value as FilterBarOptionValue[]).map((item) =>
          optionLabel(filter, item),
        ),
      );
      break;
    case "text":
      label = value as string;
      break;
    case "number-range": {
      const range = value as FilterBarNumberRange;
      const formatter = new Intl.NumberFormat(
        filter.numberProps?.locale ?? locale,
        filter.numberProps?.format,
      );
      label = messages.range(
        range.min === null ? null : formatter.format(range.min),
        range.max === null ? null : formatter.format(range.max),
      );
      break;
    }
    case "date":
      label = value === null ? "" : dateLabel(value as DateValue);
      break;
    case "date-range": {
      const range = value as FilterBarDateRange;
      label = messages.range(
        range.start === null ? null : dateLabel(range.start),
        range.end === null ? null : dateLabel(range.end),
      );
      break;
    }
    default:
      return filter.label;
  }
  return label ? `${filter.label}: ${label}` : filter.label;
}
export function mergeEdits(
  value: RuntimeValues,
  edits: RuntimeValues,
  filters: readonly RuntimeFilter[],
  disabled: boolean,
): RuntimeValues {
  const next = { ...value };
  for (const filter of filters)
    if (
      !disabled &&
      !filter.disabled &&
      Object.prototype.hasOwnProperty.call(edits, filter.id)
    )
      next[filter.id] = edits[filter.id];
  return next;
}
