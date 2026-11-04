"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/drawer";
import { ScrollArea } from "@/components/scroll-area";
import { cn } from "@/utils";

import type {
  FilterBarApplyMode,
  FilterBarClassNames,
  FilterBarMessages,
} from "./filter-bar.types";
import { FilterControl } from "./filter-bar-controls";
import {
  getError,
  mergeEdits,
  type RuntimeFilter,
  type RuntimeValues,
  valuesEqual,
} from "./filter-bar-state";

interface PanelProps {
  filters: readonly RuntimeFilter[];
  value: RuntimeValues;
  resetValue: RuntimeValues;
  applyMode: FilterBarApplyMode;
  disabled: boolean;
  locale: string;
  id: string;
  messages: FilterBarMessages;
  classNames: FilterBarClassNames;
  onChange: (
    value: RuntimeValues,
    reason: "change" | "apply" | "clear-all",
    filterId?: string,
  ) => void;
}
export function FilterBarPanel({
  filters,
  value,
  resetValue,
  applyMode,
  disabled,
  locale,
  id,
  messages,
  classNames,
  onChange,
}: PanelProps) {
  const [edits, setEdits] = useState<RuntimeValues>({});
  const container = useRef<HTMLDivElement>(null);
  const current = mergeEdits(value, edits, filters, disabled);
  const editable = filters.filter((filter) => !disabled && !filter.disabled);
  const invalid = editable.some((filter) =>
    Boolean(getError(filter, current[filter.id], messages)),
  );
  const changed = editable.some(
    (filter) => !valuesEqual(filter, current[filter.id], value[filter.id]),
  );
  const resettable = editable.some(
    (filter) => !valuesEqual(filter, current[filter.id], resetValue[filter.id]),
  );
  function update(filter: RuntimeFilter, next: unknown) {
    if (disabled || filter.disabled) return;
    if (applyMode === "instant" && !getError(filter, next, messages)) {
      setEdits((previous) => {
        const updated = { ...previous };
        delete updated[filter.id];
        return updated;
      });
      if (!valuesEqual(filter, next, value[filter.id]))
        onChange({ ...value, [filter.id]: next }, "change", filter.id);
    } else {
      setEdits((previous) => {
        const updated = { ...previous };
        if (valuesEqual(filter, next, value[filter.id]))
          delete updated[filter.id];
        else updated[filter.id] = next;
        return updated;
      });
    }
  }
  function clear() {
    const next: RuntimeValues = {};
    for (const filter of editable)
      if (!valuesEqual(filter, value[filter.id], resetValue[filter.id]))
        next[filter.id] = resetValue[filter.id];
    if (applyMode === "staged") setEdits(next);
    else {
      setEdits({});
      if (
        editable.some(
          (filter) =>
            !valuesEqual(filter, value[filter.id], resetValue[filter.id]),
        )
      )
        onChange({ ...value, ...next }, "clear-all");
    }
  }
  return (
    <div
      ref={container}
      data-ajna-component="filter-bar-panel-inner"
      className="flex min-h-0 flex-1 flex-col"
    >
      <DrawerHeader
        className={cn(
          "shrink-0 gap-1 border-b border-solid border-ajna-border px-4 py-3 text-start group-data-[swipe-axis=y]/ajna-drawer:pt-1 group-data-[swipe-axis=y]/ajna-drawer:text-start",
          classNames.panelHeader,
        )}
      >
        <div
          data-ajna-component="filter-bar-panel-heading"
          className="flex items-center justify-between gap-3"
        >
          <DrawerTitle>{messages.filters}</DrawerTitle>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label={messages.close}
              />
            }
          >
            <X
              aria-hidden="true"
              data-ajna-component="filter-bar-close-icon"
              className="h-4 w-4"
            />
          </DrawerClose>
        </div>
        <DrawerDescription className="leading-5">
          {applyMode === "staged"
            ? messages.stagedDescription
            : messages.instantDescription}
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea
        className={cn("min-h-0 flex-1", classNames.panelBody)}
        viewportProps={{ role: "region", "aria-label": messages.filterOptions }}
      >
        <div
          data-ajna-component="filter-bar-fields"
          className="flex flex-col gap-5 p-4"
        >
          {filters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              value={current[filter.id]}
              resetValue={resetValue[filter.id]}
              onValueChange={(next) => update(filter, next)}
              disabled={disabled}
              id={`${id}-${encodeURIComponent(filter.id)}`}
              locale={locale}
              messages={messages}
              popupContainer={container}
              className={classNames.field}
            />
          ))}
        </div>
      </ScrollArea>
      <DrawerFooter
        className={cn(
          "flex shrink-0 flex-row items-center justify-between gap-3 border-t border-solid border-ajna-border p-4",
          classNames.panelFooter,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          disabled={!resettable}
          onClick={clear}
        >
          {messages.clearAll}
        </Button>
        <div
          data-ajna-component="filter-bar-panel-actions"
          className="flex items-center gap-2"
        >
          <DrawerClose render={<Button type="button" variant="outline" />}>
            {applyMode === "staged" ? messages.cancel : messages.done}
          </DrawerClose>
          {applyMode === "staged" && (
            <DrawerClose
              disabled={disabled || invalid}
              render={
                <Button
                  type="button"
                  variant="primary"
                  disabled={disabled || invalid}
                  onClick={() => {
                    if (changed && !invalid) onChange(current, "apply");
                    setEdits({});
                  }}
                />
              }
            >
              {messages.apply}
            </DrawerClose>
          )}
        </div>
      </DrawerFooter>
    </div>
  );
}
