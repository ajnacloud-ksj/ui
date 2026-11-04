"use client";

import type { DateValue } from "@internationalized/date";
import { CalendarDays } from "lucide-react";
import {
  forwardRef,
  type ReactElement,
  type RefAttributes,
  useRef,
} from "react";
import {
  type DateInputProps as AriaDateInputProps,
  DatePicker as AriaDatePicker,
  type DatePickerProps,
  Group,
  useLocale,
} from "react-aria-components";

import { Popover, type PopoverContentProps } from "@/components/popover";
import { cn } from "@/utils";

import { DateInputCalendar } from "./date-input-calendar";
import {
  DateClearButton,
  dateControlClasses,
  DateLocale,
  DateSegments,
} from "./date-input-parts";

export interface DateInputProps<T extends DateValue = DateValue> extends Omit<
  DatePickerProps<T>,
  "children"
> {
  locale?: string;
  /** Hides the calendar button and popup. @default false */
  hideCalendar?: boolean;
  /** Allows clearing a populated date. @default true */
  clearable?: boolean;
  clearLabel?: string;
  calendarLabel?: string;
  todayLabel?: string;
  triggerIcon?: ReactElement;
  inputProps?: Omit<AriaDateInputProps, "children" | "slot">;
  segmentClassName?: string;
  popoverProps?: Omit<
    PopoverContentProps,
    "children" | "render" | "anchor" | "initialFocus" | "finalFocus"
  >;
}

const DateInputRoot = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
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
    const groupRef = useRef<HTMLDivElement>(null);
    const { className: popupClassName, ...popupProps } = popoverProps ?? {};
    return (
      <DateLocale locale={locale}>
        <AriaDatePicker
          {...props}
          isOpen={hideCalendar ? false : isOpen}
          defaultOpen={!hideCalendar && defaultOpen}
          ref={ref}
          data-ajna-component="date-input"
          data-slot="date-input"
          className="box-border w-full min-w-0"
        >
          {(state) => (
            <Popover.Root
              open={!hideCalendar && state.isOpen}
              onOpenChange={(open) => state.state.setOpen(open)}
            >
              <Group
                ref={groupRef}
                style={
                  typeof style === "function"
                    ? style({ ...state, defaultStyle: {} })
                    : style
                }
                data-ajna-component="date-input-group"
                data-slot="date-input-group"
                className={() =>
                  cn(
                    dateControlClasses,
                    typeof className === "function"
                      ? className({ ...state, defaultClassName: undefined })
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
                  dateValue={state.state.value ?? props.placeholderValue}
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
export const DateInput = DateInputRoot as <T extends DateValue = DateValue>(
  props: DateInputProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement;

function DateInputPopover({
  calendarLabel,
  todayLabel,
  dateValue,
  ...props
}: PopoverContentProps & {
  calendarLabel: string;
  todayLabel: string;
  dateValue?: DateValue | null;
}) {
  const { direction } = useLocale();
  return (
    <Popover.Content {...props} dir={direction}>
      <DateInputCalendar
        aria-label={calendarLabel}
        todayLabel={todayLabel}
        timeZone={
          dateValue && "timeZone" in dateValue ? dateValue.timeZone : undefined
        }
      />
    </Popover.Content>
  );
}
