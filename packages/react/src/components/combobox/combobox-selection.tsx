"use client";

import type { ReactNode } from "react";

import { cn } from "@/utils";

import type {
  ComboboxClassNames,
  ComboboxMessages,
  ComboboxSelectedOptionContext,
  ComboboxSelectionDisplay,
} from "./combobox.types";
import type { ComboboxValue } from "./combobox-parts";
import * as Parts from "./combobox-parts";
import type { ComboboxRecord } from "./use-combobox-options";

interface SelectionProps {
  multiple: boolean;
  selection: ComboboxRecord<unknown, ComboboxValue>[];
  selectionDisplay: ComboboxSelectionDisplay;
  maxVisibleSelections: number;
  query: string;
  disabled?: boolean;
  readOnly?: boolean;
  classNames: ComboboxClassNames;
  messages: ComboboxMessages;
  renderSelectedOption?: (
    context: ComboboxSelectedOptionContext<unknown, ComboboxValue>,
  ) => ReactNode;
}
export function ComboboxSelection({
  multiple,
  selection,
  selectionDisplay,
  maxVisibleSelections,
  query,
  disabled,
  readOnly,
  classNames,
  messages,
  renderSelectedOption,
}: SelectionProps) {
  const filled = selection.length > 0;
  function selectedContent(record: ComboboxRecord<unknown, ComboboxValue>) {
    return renderSelectedOption
      ? renderSelectedOption({
          value: record.value,
          option: record.option,
          label: record.label,
        })
      : record.label;
  }
  const limit =
    maxVisibleSelections === Infinity
      ? selection.length
      : Math.max(
          0,
          Math.floor(
            Number.isFinite(maxVisibleSelections) ? maxVisibleSelections : 3,
          ),
        );
  const shown = selection.slice(0, limit);
  const hidden = selection.length - shown.length;
  return (
    <>
      {multiple &&
        selectionDisplay === "pills" &&
        shown.map((record) => (
          <Parts.ComboboxChip
            showRemove={false}
            key={`${typeof record.value}:${record.value}`}
            aria-label={record.label}
            className={classNames.pill}
          >
            <span
              data-ajna-component="combobox-pill-label"
              className="min-w-0 truncate"
            >
              {selectedContent(record)}
            </span>
            {!disabled && !readOnly && (
              <Parts.ComboboxChipRemove
                aria-label={messages.remove(record.label)}
                className={classNames.pillRemove}
              />
            )}
          </Parts.ComboboxChip>
        ))}
      {multiple && selectionDisplay === "names" && shown.length > 0 && (
        <span
          data-ajna-component="combobox-names"
          className="max-w-full truncate px-1 text-sm"
        >
          {shown.map((record, index) => (
            <span key={`${typeof record.value}:${record.value}`}>
              {index > 0 && ", "}
              {selectedContent(record)}
            </span>
          ))}
        </span>
      )}
      {multiple && selectionDisplay === "count" && filled && (
        <span
          data-ajna-component="combobox-count"
          className="whitespace-nowrap px-1 text-sm"
        >
          {messages.selectedCount(selection.length)}
        </span>
      )}
      {multiple && selectionDisplay !== "count" && hidden > 0 && (
        <span
          data-ajna-component="combobox-overflow"
          className={cn(
            "whitespace-nowrap px-1 text-xs text-ajna-muted-foreground",
            classNames.overflow,
          )}
          aria-label={`${hidden} more selected`}
        >
          {messages.overflowCount(hidden)}
        </span>
      )}
      {!multiple && filled && query === "" && (
        <span
          data-ajna-component="combobox-selected-value"
          className="pointer-events-none absolute inset-y-0 end-1 start-3 flex min-w-0 items-center overflow-hidden whitespace-nowrap text-sm"
          aria-hidden="true"
        >
          {selectedContent(selection[0])}
        </span>
      )}
    </>
  );
}
