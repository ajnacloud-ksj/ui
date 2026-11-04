"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import {
  forwardRef,
  type ReactElement,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

import type {
  ComboboxFooterContext,
  ComboboxInputChangeDetails,
  ComboboxOption,
  ComboboxOptionValue,
  ComboboxProps,
  ComboboxValueChangeDetails,
} from "./combobox.types";
import { ComboboxOptions } from "./combobox-options";
import type { ComboboxValue } from "./combobox-parts";
import * as Parts from "./combobox-parts";
import { ComboboxSelection } from "./combobox-selection";
import { useComboboxFocus } from "./use-combobox-focus";
import { useComboboxFooter } from "./use-combobox-footer";
import {
  type ComboboxRecord,
  useComboboxOptions,
} from "./use-combobox-options";
import {
  inputChangeDetails,
  useComboboxFormReset,
  useComboboxState,
} from "./use-combobox-state";

const emptyOptions: readonly unknown[] = [];
const defaultGetLabel = (option: unknown) =>
  (option as { label: string }).label;
const defaultGetValue = (option: unknown) =>
  (option as { value: ComboboxValue }).value;
const defaultDisabled = (option: unknown) =>
  Boolean((option as { disabled?: boolean }).disabled);
const defaultMissingLabel = (value: ComboboxValue) => String(value);
const defaultMessages = {
  clear: "Clear selection",
  remove: (label: string) => `Remove ${label}`,
  selectedCount: (count: number) => `${count} selected`,
  overflowCount: (count: number) => `+${count}`,
};
type RuntimeValue = ComboboxValue | readonly ComboboxValue[] | null;
type RuntimeProps = Omit<
  ComboboxProps<unknown, ComboboxValue, boolean>,
  "getLabel" | "getValue" | "onValueChange" | "footer"
> & {
  getLabel?: (option: unknown) => string;
  getValue?: (option: unknown) => ComboboxValue;
  onValueChange?: (
    value: ComboboxValue | ComboboxValue[] | null,
    details: ComboboxValueChangeDetails<unknown>,
  ) => void;
  footer?: ComboboxProps<unknown, ComboboxValue, boolean>["footer"];
};

const ComboboxControl = forwardRef<HTMLInputElement, RuntimeProps>(
  function ComboboxControl(
    {
      options,
      selectedOptions = emptyOptions,
      getLabel = defaultGetLabel,
      getValue = defaultGetValue,
      isOptionDisabled = defaultDisabled,
      getMissingLabel = defaultMissingLabel,
      multiple = false,
      value: controlledValue,
      defaultValue,
      onValueChange,
      inputValue: controlledQuery,
      defaultInputValue = "",
      onInputValueChange,
      filterOption,
      closeOnSelect = !multiple,
      clearSearchOnSelect = true,
      hideSelectedOptions = false,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      selectionDisplay = "pills",
      maxVisibleSelections = 3,
      renderSelectedOption,
      renderOption,
      groupBy,
      renderGroupLabel,
      footer,
      isLoading = false,
      isClearable = false,
      placeholder,
      emptyContent = "No results found.",
      loadingContent = "Loading…",
      messages: messageOverrides,
      id: idProp,
      name,
      form,
      required,
      disabled,
      readOnly,
      onFocus,
      onBlur,
      inputProps,
      popupProps,
      size = "base",
      classNames = {},
      className,
      style,
      ...aria
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const input = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => input.current!, []);
    const [initialValue] = useState<RuntimeValue>(
      () => defaultValue ?? (multiple ? [] : null),
    );
    const [value, setValue] = useComboboxState<RuntimeValue>(
      controlledValue,
      initialValue,
    );
    const [query, setQuery] = useComboboxState(
      controlledQuery,
      defaultInputValue,
    );
    const [open, setOpen] = useComboboxState(controlledOpen, defaultOpen);
    const values = useMemo<readonly ComboboxValue[]>(
      () =>
        Array.isArray(value)
          ? value
          : value === null
            ? []
            : [value as ComboboxValue],
      [value],
    );
    const focus = useComboboxFocus(open, onFocus, onBlur);
    const footerFocus = useComboboxFooter(open, input, focus.control);
    const data = useComboboxOptions({
      options,
      selectedOptions,
      values,
      getLabel,
      getValue,
      isOptionDisabled,
      getMissingLabel,
      query,
      filterOption,
      hideSelectedOptions,
      groupBy,
    });
    const messages = { ...defaultMessages, ...messageOverrides };
    const actions = useRef<BaseCombobox.Root.Actions | null>(null);
    const reset = useCallback(() => {
      if (controlledValue === undefined) setValue(initialValue);
      if (controlledQuery === undefined) setQuery(defaultInputValue);
      if (controlledOpen === undefined) setOpen(false);
    }, [
      controlledValue,
      controlledQuery,
      controlledOpen,
      initialValue,
      defaultInputValue,
      setValue,
      setQuery,
      setOpen,
    ]);
    useComboboxFormReset(input, form, reset);

    function changeQuery(next: string, details: ComboboxInputChangeDetails) {
      onInputValueChange?.(next, details);
      if (!details.isCanceled) setQuery(next);
    }
    function changeSelection(
      next: ComboboxValue | ComboboxValue[] | null,
      details: BaseCombobox.Root.ChangeEventDetails,
    ) {
      if (details.reason === "input-clear") {
        details.cancel();
        return;
      }
      const ids = Array.isArray(next) ? next : next === null ? [] : [next];
      const resolved = ids.flatMap((id) => {
        const option = data.registry.get(id)?.option;
        return option === undefined ? [] : [option];
      });
      const enhanced = Object.assign(details, { selectedOptions: resolved });
      onValueChange?.(next, enhanced);
      if (details.isCanceled) return;
      setValue(next);
      if (clearSearchOnSelect && query !== "")
        changeQuery("", inputChangeDetails(details));
      if (
        multiple &&
        closeOnSelect &&
        query === "" &&
        details.reason === "item-press"
      )
        actions.current?.close();
    }
    const footerContext = {
      inputValue: query,
      value: multiple ? [...values] : (values[0] ?? null),
      selectedOptions: data.selection.flatMap((record) =>
        record.option === undefined ? [] : [record.option],
      ),
      close: () => {
        input.current?.focus();
        actions.current?.close();
      },
    } as ComboboxFooterContext<unknown, ComboboxValue, boolean>;
    const footerContent =
      typeof footer === "function" ? footer(footerContext) : footer;
    const filled = values.length > 0;
    const compact = size === "sm";
    const {
      className: inputClassName,
      onFocus: inputFocus,
      onBlur: inputBlur,
      ...nativeInput
    } = inputProps ?? {};
    return (
      <Parts.ComboboxRoot<
        ComboboxValue,
        boolean,
        ComboboxRecord<unknown, ComboboxValue>
      >
        id={id}
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        multiple={multiple}
        items={data.items}
        filteredItems={data.visible}
        filter={null}
        itemToStringLabel={getMissingLabel}
        value={multiple ? [...values] : (values[0] ?? null)}
        onValueChange={changeSelection}
        inputValue={query}
        onInputValueChange={(next, details) => {
          if (details.reason === "item-press" || details.reason === "none") {
            details.cancel();
            return;
          }
          if (
            details.reason === "input-clear" &&
            details.isItemPress &&
            !clearSearchOnSelect
          ) {
            details.cancel();
            return;
          }
          changeQuery(next, details);
        }}
        open={open}
        defaultOpen={defaultOpen}
        actionsRef={actions}
        onOpenChange={(next, details) => {
          if (!next && details.reason === "item-press" && !closeOnSelect) {
            details.cancel();
            return;
          }
          onOpenChange?.(next, details);
          if (!details.isCanceled) setOpen(next);
        }}
      >
        <div
          data-ajna-component="combobox"
          data-slot="combobox"
          className={cn("box-border w-full min-w-0", className)}
          style={style}
          onFocusCapture={focus.onFocusCapture}
          onBlurCapture={focus.onBlurCapture}
        >
          {filled && (
            <span
              id={`${id}-selection`}
              data-ajna-component="combobox-selection-description"
              className="sr-only"
            >
              Selected:{" "}
              {data.selection.map((record) => record.label).join(", ")}
            </span>
          )}
          <Parts.ComboboxInputGroup
            ref={focus.control}
            onKeyDown={footerFocus.onKeyDown}
            className={cn(compact && "min-h-8 text-xs", classNames.control)}
          >
            <Parts.ComboboxChips
              className={cn(
                "relative",
                !multiple && "flex-nowrap p-0",
                classNames.selectedValues,
              )}
            >
              <ComboboxSelection
                multiple={multiple}
                selection={data.selection}
                selectionDisplay={selectionDisplay}
                maxVisibleSelections={maxVisibleSelections}
                query={query}
                disabled={disabled}
                readOnly={readOnly}
                classNames={classNames}
                messages={messages}
                renderSelectedOption={renderSelectedOption}
              />
              <Parts.ComboboxChipsInput
                {...nativeInput}
                {...aria}
                ref={input}
                id={id}
                aria-busy={isLoading || undefined}
                aria-describedby={
                  [
                    aria["aria-describedby"],
                    filled ? `${id}-selection` : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                placeholder={filled ? undefined : placeholder}
                className={(state) =>
                  cn(
                    multiple && "h-7 w-8 px-1",
                    compact &&
                      (multiple ? "h-6 text-xs" : "h-[1.875rem] text-xs"),
                    classNames.input,
                    typeof inputClassName === "function"
                      ? inputClassName(state)
                      : inputClassName,
                  )
                }
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </Parts.ComboboxChips>
            {isLoading && (
              <Spinner size="sm" aria-hidden="true" className="mx-1" />
            )}
            {isClearable && filled && !disabled && !readOnly && (
              <Parts.ComboboxClear
                aria-label={messages.clear}
                className={classNames.clear}
              />
            )}
            <Parts.ComboboxTrigger
              disabled={disabled || readOnly}
              className={classNames.trigger}
            />
          </Parts.ComboboxInputGroup>
          <Parts.ComboboxContent
            {...popupProps}
            anchor={focus.control}
            ref={focus.popup}
            onKeyDown={footerFocus.onKeyDown}
            className={classNames.popup}
          >
            <Parts.ComboboxStatus
              aria-live="polite"
              className={cn(!isLoading && "sr-only m-0 p-0", classNames.status)}
            >
              {isLoading ? loadingContent : null}
            </Parts.ComboboxStatus>
            <Parts.ComboboxEmpty className={classNames.empty}>
              {isLoading ? null : emptyContent}
            </Parts.ComboboxEmpty>
            <ComboboxOptions
              visible={data.visible}
              groups={data.groups}
              grouped={Boolean(groupBy)}
              query={query}
              isLoading={isLoading}
              classNames={classNames}
              renderOption={renderOption}
              renderGroupLabel={renderGroupLabel}
            />
            {footerContent != null && (
              <div
                ref={footerFocus.footer}
                data-ajna-component="combobox-footer"
                data-slot="combobox-footer"
                className={cn(
                  "box-border shrink-0 border-0 border-t border-solid border-ajna-border p-2",
                  classNames.footer,
                )}
              >
                {footerContent}
              </div>
            )}
          </Parts.ComboboxContent>
        </div>
      </Parts.ComboboxRoot>
    );
  },
);

const ConfiguredCombobox = ComboboxControl as <
  Option = ComboboxOption,
  Value extends ComboboxValue = ComboboxOptionValue<Option>,
  Multiple extends boolean = false,
>(
  props: ComboboxProps<Option, Value, Multiple>,
) => ReactElement;
export const Combobox = Object.assign(ConfiguredCombobox, {
  Root: Parts.ComboboxRoot,
  InputGroup: Parts.ComboboxInputGroup,
  Input: Parts.ComboboxInput,
  ChipsInput: Parts.ComboboxChipsInput,
  Trigger: Parts.ComboboxTrigger,
  Clear: Parts.ComboboxClear,
  Value: Parts.ComboboxValue,
  Content: Parts.ComboboxContent,
  List: Parts.ComboboxList,
  Item: Parts.ComboboxItem,
  ItemIndicator: Parts.ComboboxItemIndicator,
  Empty: Parts.ComboboxEmpty,
  Status: Parts.ComboboxStatus,
  Group: Parts.ComboboxGroup,
  GroupLabel: Parts.ComboboxGroupLabel,
  Label: Parts.ComboboxLabel,
  Collection: Parts.ComboboxCollection,
  Separator: Parts.ComboboxSeparator,
  Chips: Parts.ComboboxChips,
  Chip: Parts.ComboboxChip,
  ChipRemove: Parts.ComboboxChipRemove,
});
