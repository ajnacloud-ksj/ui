"use client";

import type { ReactNode } from "react";

import { Checkbox } from "@/components/checkbox";
import { Combobox } from "@/components/combobox";
import { DateInput } from "@/components/date-input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/field";
import { Input } from "@/components/input";
import { NumberInput } from "@/components/number-input";
import { ScrollArea } from "@/components/scroll-area";
import { Select } from "@/components/select";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

import type {
  FilterBarDateRange,
  FilterBarNumberRange,
  FilterBarOption,
  FilterBarOptionValue,
} from "./filter-bar.types";
import { type FieldContext, getError, optionLabel } from "./filter-bar-state";

function OptionContent({
  option,
}: {
  option: FilterBarOption<FilterBarOptionValue>;
}) {
  return (
    <>
      <span
        data-ajna-component="filter-bar-option-label"
        className="min-w-0 flex-1 truncate"
      >
        {option.content ?? option.label}
      </span>
      {option.count !== undefined && (
        <span
          data-ajna-component="filter-bar-option-count"
          className="ms-auto ps-2 tabular-nums text-ajna-muted-foreground"
        >
          {option.count}
        </span>
      )}
    </>
  );
}
export function FilterControl({
  filter,
  value,
  resetValue,
  onValueChange,
  disabled,
  id,
  messages,
  locale,
  popupContainer,
  className,
}: FieldContext) {
  const error = getError(filter, value, messages);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy =
    [filter.description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  const locked = disabled || Boolean(filter.disabled);
  const choiceDisabled = locked || Boolean(filter.isLoading);
  const aria = {
    "aria-labelledby": labelId,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error) || undefined,
  };
  const options = filter.options ?? [];
  let control: ReactNode;
  switch (filter.type) {
    case "toggle":
      control = (
        <Checkbox
          id={id}
          checked={value as boolean}
          disabled={locked}
          onCheckedChange={onValueChange}
          {...aria}
        />
      );
      break;
    case "text":
      control = (
        <Input
          {...filter.inputProps}
          id={id}
          value={value as string}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          disabled={locked}
          placeholder={filter.placeholder}
          {...aria}
        />
      );
      break;
    case "select":
      control = (
        <Select<FilterBarOption<FilterBarOptionValue>, FilterBarOptionValue>
          id={id}
          options={options}
          value={value as FilterBarOptionValue | null}
          onValueChange={(next) => onValueChange(next ?? resetValue)}
          disabled={choiceDisabled}
          placeholder={filter.placeholder ?? filter.label}
          renderOption={(option) => <OptionContent option={option} />}
          valueProps={{
            children: (selected) =>
              selected === null
                ? (filter.placeholder ?? filter.label)
                : optionLabel(filter, selected as FilterBarOptionValue),
          }}
          contentProps={{
            container: popupContainer,
            alignItemWithTrigger: false,
          }}
          {...aria}
        />
      );
      break;
    case "multi-select": {
      const selected = value as FilterBarOptionValue[];
      control = filter.searchable ? (
        <Combobox
          id={id}
          multiple
          options={options}
          value={selected}
          onValueChange={onValueChange}
          isLoading={filter.isLoading}
          disabled={locked}
          getMissingLabel={filter.getMissingLabel}
          placeholder={
            filter.searchPlaceholder ?? filter.placeholder ?? filter.label
          }
          renderOption={(option) => <OptionContent option={option} />}
          emptyContent={messages.emptyOptions}
          loadingContent={messages.loading}
          messages={{
            clear: messages.clearField,
            remove: (label) => messages.removeFilter(label),
            selectedCount: messages.selectedCount,
            overflowCount: messages.overflowCount,
          }}
          popupProps={{ container: popupContainer }}
          {...aria}
        />
      ) : options.length === 0 ? (
        <p
          data-ajna-component="filter-bar-empty-options"
          role="status"
          className="m-0 py-2 text-sm text-ajna-muted-foreground"
        >
          {filter.isLoading ? messages.loading : messages.emptyOptions}
        </p>
      ) : (
        <ScrollArea
          className="max-h-56"
          viewportProps={{
            className: "max-h-56",
            role: "region",
            "aria-label": filter.label,
          }}
        >
          <div
            data-ajna-component="filter-bar-options"
            className="flex flex-col"
          >
            {options.map((option, index) => (
              <FieldLabel
                key={`${typeof option.value}:${option.value}`}
                htmlFor={`${id}-${index}`}
                className={cn(
                  "flex min-h-9 cursor-pointer items-center gap-2 rounded-ajna-base py-1.5 text-sm font-normal hover:bg-ajna-accent",
                  (choiceDisabled || option.disabled) &&
                    "cursor-not-allowed opacity-50",
                )}
              >
                <Checkbox
                  id={`${id}-${index}`}
                  checked={selected.includes(option.value)}
                  disabled={choiceDisabled || option.disabled}
                  onCheckedChange={(checked) =>
                    onValueChange(
                      checked
                        ? [...selected, option.value]
                        : selected.filter((item) => item !== option.value),
                    )
                  }
                  aria-describedby={describedBy}
                  aria-label={option.label}
                />
                <OptionContent option={option} />
              </FieldLabel>
            ))}
          </div>
        </ScrollArea>
      );
      break;
    }
    case "number-range": {
      const range = value as FilterBarNumberRange;
      control = (
        <div
          data-ajna-component="filter-bar-range"
          className="grid min-w-0 grid-cols-2 gap-3"
        >
          {(["min", "max"] as const).map((key) => (
            <Field key={key}>
              <FieldLabel
                id={`${id}-${key}-label`}
                htmlFor={`${id}-${key}`}
                className="text-sm font-normal text-ajna-muted-foreground"
              >
                {key === "min" ? messages.minimum : messages.maximum}
              </FieldLabel>
              <NumberInput
                {...filter.numberProps}
                locale={filter.numberProps?.locale ?? locale}
                id={`${id}-${key}`}
                value={range[key]}
                onValueChange={(next) =>
                  onValueChange({ ...range, [key]: next })
                }
                disabled={locked}
                allowOutOfRange
                placeholder={
                  key === "min" ? messages.minimum : messages.maximum
                }
                aria-labelledby={`${labelId} ${id}-${key}-label`}
                aria-describedby={describedBy}
                aria-invalid={Boolean(error) || undefined}
              />
            </Field>
          ))}
        </div>
      );
      break;
    }
    case "date":
      control = (
        <DateInput
          {...filter.dateProps}
          locale={filter.dateProps?.locale ?? locale}
          value={value as string | null}
          onChange={onValueChange}
          isDisabled={locked}
          isInvalid={Boolean(error)}
          popoverProps={{
            container: popupContainer,
            ...filter.dateProps?.popoverProps,
          }}
          calendarLabel={filter.dateProps?.calendarLabel ?? filter.label}
          {...aria}
        />
      );
      break;
    case "date-range": {
      const range = value as FilterBarDateRange;
      control = (
        <div
          data-ajna-component="filter-bar-range"
          className="grid min-w-0 gap-3 sm:grid-cols-2"
        >
          {(["start", "end"] as const).map((key) => (
            <Field key={key}>
              <FieldTitle
                id={`${id}-${key}-label`}
                className="text-xs font-normal text-ajna-muted-foreground"
              >
                {key === "start" ? messages.startDate : messages.endDate}
              </FieldTitle>
              <DateInput
                {...filter.dateProps}
                locale={filter.dateProps?.locale ?? locale}
                value={range[key]}
                onChange={(next) => onValueChange({ ...range, [key]: next })}
                isDisabled={locked}
                popoverProps={{
                  container: popupContainer,
                  ...filter.dateProps?.popoverProps,
                }}
                aria-labelledby={`${labelId} ${id}-${key}-label`}
                aria-describedby={describedBy}
                isInvalid={Boolean(error)}
              />
            </Field>
          ))}
        </div>
      );
      break;
    }
    case "custom":
      control = filter.render?.({
        value,
        resetValue,
        onValueChange,
        disabled: locked,
        id,
        labelId,
        describedBy,
        error,
        popupContainer,
      });
      break;
  }
  const singleLabel =
    filter.type === "toggle" ||
    filter.type === "text" ||
    filter.type === "select" ||
    (filter.type === "multi-select" && filter.searchable);
  const toggle = filter.type === "toggle";
  const controlElement = (
    <div
      data-ajna-component="filter-bar-control"
      className={cn("min-w-0", toggle && "flex shrink-0 items-center")}
    >
      {control}
    </div>
  );
  const label = (
    <>
      {filter.icon && (
        <span
          data-ajna-component="filter-bar-field-icon"
          aria-hidden="true"
          className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
        >
          {filter.icon}
        </span>
      )}
      {filter.label}
    </>
  );
  const grouped =
    filter.type === "number-range" ||
    filter.type === "date-range" ||
    (filter.type === "multi-select" && !filter.searchable);
  return (
    <Field
      role={grouped ? "group" : undefined}
      aria-labelledby={grouped ? labelId : undefined}
      data-disabled={locked || undefined}
      data-invalid={Boolean(error) || undefined}
      className={cn("gap-2", className, filter.className)}
    >
      <div
        data-ajna-component="filter-bar-field-header"
        className={cn("flex min-w-0 items-center gap-2", toggle && "min-h-9")}
      >
        {toggle && controlElement}
        {singleLabel ? (
          <FieldLabel
            id={labelId}
            htmlFor={id}
            className={cn(
              "flex min-w-0 items-center gap-2",
              toggle && "flex-1 cursor-pointer",
            )}
          >
            {label}
          </FieldLabel>
        ) : (
          <FieldTitle id={labelId} className="flex min-w-0 items-center gap-2">
            {label}
          </FieldTitle>
        )}
        {filter.isLoading && (
          <Spinner size="sm" aria-label={messages.loading} />
        )}
      </div>
      {filter.description && (
        <FieldDescription
          id={descriptionId}
          className={toggle ? "ps-6" : undefined}
        >
          {filter.description}
        </FieldDescription>
      )}
      {!toggle && controlElement}
      {error && (
        <FieldError id={errorId} className={toggle ? "ps-6" : undefined}>
          {error}
        </FieldError>
      )}
    </Field>
  );
}
