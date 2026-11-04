"use client";

import { forwardRef, type ReactElement } from "react";

import { cn } from "@/utils";

import type {
  SelectOption,
  SelectOptionValue,
  SelectProps,
} from "./select.types";
import { SelectOptions } from "./select-options";
import * as Parts from "./select-parts";

type RuntimeProps = Omit<
  SelectProps<unknown, Parts.SelectValue, boolean>,
  "getLabel" | "getValue"
> & {
  getLabel?: (option: unknown) => string;
  getValue?: (option: unknown) => Parts.SelectValue;
};
const defaultGetLabel = (option: unknown) => (option as SelectOption).label;
const defaultGetValue = (option: unknown) =>
  (option as SelectOption<Parts.SelectValue>).value;
const defaultDisabled = (option: unknown) =>
  Boolean((option as SelectOption).disabled);

const SelectControl = forwardRef<HTMLButtonElement, RuntimeProps>(
  function SelectControl(
    {
      options,
      getLabel = defaultGetLabel,
      getValue = defaultGetValue,
      isOptionDisabled = defaultDisabled,
      groupBy,
      renderGroupLabel,
      renderOption,
      placeholder,
      size,
      className,
      style,
      triggerProps,
      valueProps,
      contentProps,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...rootProps
    },
    ref,
  ) {
    const records = options.map((option) => ({
      option,
      value: getValue(option),
      label: getLabel(option),
      disabled: isOptionDisabled(option),
    }));
    const triggerClassName = triggerProps?.className;
    return (
      <Parts.SelectRoot {...rootProps} id={id} items={records}>
        <Parts.SelectTrigger
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          {...triggerProps}
          id={id}
          ref={ref}
          size={size}
          className={
            typeof triggerClassName === "function"
              ? (state) => cn(className, triggerClassName(state))
              : cn(className, triggerClassName)
          }
          style={
            typeof triggerProps?.style === "function"
              ? (state) => ({
                  ...style,
                  ...(typeof triggerProps.style === "function"
                    ? triggerProps.style(state)
                    : triggerProps.style),
                })
              : { ...style, ...triggerProps?.style }
          }
        >
          <Parts.SelectValue placeholder={placeholder} {...valueProps} />
        </Parts.SelectTrigger>
        <Parts.SelectContent {...contentProps}>
          <SelectOptions
            records={records}
            groupBy={groupBy}
            renderGroupLabel={renderGroupLabel}
            renderOption={renderOption}
          />
        </Parts.SelectContent>
      </Parts.SelectRoot>
    );
  },
);

const ComposedSelect = SelectControl as <
  Option = SelectOption,
  Value extends Parts.SelectValue = SelectOptionValue<Option>,
  Multiple extends boolean = false,
>(
  props: SelectProps<Option, Value, Multiple>,
) => ReactElement;
export const Select = Object.assign(ComposedSelect, {
  Root: Parts.SelectRoot,
  Trigger: Parts.SelectTrigger,
  Value: Parts.SelectValue,
  Content: Parts.SelectContent,
  Group: Parts.SelectGroup,
  Label: Parts.SelectLabel,
  GroupLabel: Parts.SelectGroupLabel,
  Item: Parts.SelectItem,
  Separator: Parts.SelectSeparator,
  ScrollUpButton: Parts.SelectScrollUpButton,
  ScrollDownButton: Parts.SelectScrollDownButton,
});
