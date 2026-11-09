"use client";

import { CalendarDays } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type ReactElement,
  useMemo,
  useRef,
} from "react";
import {
  DatePicker as AriaDatePicker,
  Group,
  useLocale,
} from "react-aria-components";

import { Popover, type PopoverContentProps } from "@/components/popover";
import { cn } from "@/utils";
import { parseISODate, serializeDate } from "@/utils/date";

import { DateInputCalendar } from "./date-input-calendar";
import {
  DateClearButton,
  dateControlClasses,
  DateLocale,
  DateSegments,
} from "./date-input-parts";

export interface DateInputState {
  isFocusWithin: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  isOpen: boolean;
}
export interface DateInputSegmentState {
  isHovered: boolean;
  isFocusWithin: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
}
export interface DateInputSegmentProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className" | "style"
> {
  className?: string | ((state: DateInputSegmentState) => string);
  style?: CSSProperties | ((state: DateInputSegmentState) => CSSProperties);
}
export interface DateInputProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  | "children"
  | "defaultValue"
  | "onChange"
  | "className"
  | "style"
  | "onFocus"
  | "onBlur"
  | "onKeyDown"
  | "onKeyUp"
> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  minValue?: string | null;
  maxValue?: string | null;
  placeholderValue?: string | null;
  isDateUnavailable?: (value: string) => boolean;
  validate?: (
    value: string | null,
  ) => string | string[] | true | null | undefined;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationBehavior?: "native" | "aria";
  name?: string;
  form?: string;
  autoFocus?: boolean;
  onFocus?: (event: FocusEvent<Element>) => void;
  onBlur?: (event: FocusEvent<Element>) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (event: KeyboardEvent<Element>) => void;
  onKeyUp?: (event: KeyboardEvent<Element>) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  shouldCloseOnSelect?: boolean;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  shouldForceLeadingZeros?: boolean;
  className?: string | ((state: DateInputState) => string);
  style?: CSSProperties | ((state: DateInputState) => CSSProperties);
  locale?: string;
  /** Hides the calendar button and popup. @default false */
  hideCalendar?: boolean;
  /** Allows clearing a populated date. @default true */
  clearable?: boolean;
  clearLabel?: string;
  calendarLabel?: string;
  todayLabel?: string;
  triggerIcon?: ReactElement;
  inputProps?: DateInputSegmentProps;
  segmentClassName?: string;
  popoverProps?: Omit<
    PopoverContentProps,
    "children" | "render" | "anchor" | "initialFocus" | "finalFocus"
  >;
}

const DateInputRoot = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      value,
      defaultValue,
      onChange,
      minValue,
      maxValue,
      placeholderValue,
      isDateUnavailable,
      validate,
      locale,
      hideCalendar = false,
      clearable = true,
      clearLabel = "Clear date",
      calendarLabel = "Choose date",
      todayLabel = "Today",
      triggerIcon,
      inputProps,
      segmentClassName,
      popoverProps,
      className,
      style,
      isOpen,
      defaultOpen,
      ...props
    },
    ref,
  ) {
    const date = useMemo(() => parseISODate(value), [value]);
    const initialDate = useMemo(
      () => parseISODate(defaultValue),
      [defaultValue],
    );
    const minimum = useMemo(() => parseISODate(minValue), [minValue]);
    const maximum = useMemo(() => parseISODate(maxValue), [maxValue]);
    const placeholder = useMemo(
      () => parseISODate(placeholderValue),
      [placeholderValue],
    );
    const groupRef = useRef<HTMLDivElement>(null);
    const { className: popupClassName, ...popupProps } = popoverProps ?? {};
    return (
      <DateLocale locale={locale}>
        <AriaDatePicker
          {...props}
          value={value === undefined ? undefined : date}
          defaultValue={initialDate}
          minValue={minimum ?? undefined}
          maxValue={maximum ?? undefined}
          placeholderValue={placeholder ?? undefined}
          onChange={(next) => onChange?.(serializeDate(next))}
          isDateUnavailable={
            isDateUnavailable
              ? (next) => isDateUnavailable(serializeDate(next)!)
              : undefined
          }
          validate={
            validate ? (next) => validate(serializeDate(next)) : undefined
          }
          isOpen={hideCalendar ? false : isOpen}
          defaultOpen={!hideCalendar && defaultOpen}
          ref={ref}
          data-ajna-component="date-input"
          data-slot="date-input"
          className="box-border w-full min-w-0"
        >
          {(state) => (
            <Popover.Root
              modal
              open={!hideCalendar && state.isOpen}
              onOpenChange={(open) => state.state.setOpen(open)}
            >
              <Group
                ref={groupRef}
                style={
                  typeof style === "function"
                    ? style(publicDateState(state))
                    : style
                }
                data-ajna-component="date-input-group"
                data-slot="date-input-group"
                className={() =>
                  cn(
                    dateControlClasses,
                    typeof className === "function"
                      ? className(publicDateState(state))
                      : className,
                  )
                }
              >
                <DateSegments
                  {...inputProps}
                  segmentClassName={segmentClassName}
                />
                {clearable && state.state.value !== null && (
                  <DateClearButton
                    label={clearLabel}
                    isDisabled={state.isDisabled || state.isReadOnly}
                    onClear={() => {
                      state.state.setValue(null);
                      state.state.setOpen(false);
                      groupRef.current
                        ?.querySelector<HTMLElement>('[role="spinbutton"]')
                        ?.focus();
                    }}
                  />
                )}
                {!hideCalendar && (
                  <Popover.Trigger
                    type="button"
                    disabled={state.isDisabled || state.isReadOnly}
                    aria-label={calendarLabel}
                    data-ajna-component="date-input-trigger"
                    data-slot="date-input-trigger"
                    className="m-0 me-0.5 box-border inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 bg-transparent p-0 text-ajna-muted-foreground outline-none hover:bg-ajna-accent hover:text-ajna-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span
                      data-ajna-component="date-input-icon"
                      aria-hidden="true"
                      className="pointer-events-none flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4"
                    >
                      {triggerIcon ?? <CalendarDays size={16} />}
                    </span>
                  </Popover.Trigger>
                )}
              </Group>
              {!hideCalendar && (
                <DateInputPopover
                  {...popupProps}
                  calendarLabel={calendarLabel}
                  todayLabel={todayLabel}
                  anchor={groupRef}
                  align={popupProps.align ?? "start"}
                  sideOffset={popupProps.sideOffset ?? 6}
                  initialFocus={false}
                  aria-label={calendarLabel}
                  className={(popupState) =>
                    cn(
                      "w-auto gap-0 overflow-hidden p-0",
                      typeof popupClassName === "function"
                        ? popupClassName(popupState)
                        : popupClassName,
                    )
                  }
                />
              )}
            </Popover.Root>
          )}
        </AriaDatePicker>
      </DateLocale>
    );
  },
);
DateInputRoot.displayName = "DateInput";
export const DateInput = DateInputRoot;

function publicDateState(state: DateInputState): DateInputState {
  return {
    isFocusWithin: state.isFocusWithin,
    isFocusVisible: state.isFocusVisible,
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isRequired: state.isRequired,
    isOpen: state.isOpen,
  };
}

function DateInputPopover({
  calendarLabel,
  todayLabel,
  ...props
}: PopoverContentProps & {
  calendarLabel: string;
  todayLabel: string;
}) {
  const { direction } = useLocale();
  return (
    <Popover.Content {...props} dir={direction}>
      <DateInputCalendar aria-label={calendarLabel} todayLabel={todayLabel} />
    </Popover.Content>
  );
}
