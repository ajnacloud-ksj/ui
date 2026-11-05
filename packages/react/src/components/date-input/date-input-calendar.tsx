"use client";

import { isSameDay, toCalendar, today } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useId, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarStateContext,
  CalendarYearPicker,
  DatePickerStateContext,
  HeadingContext,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

import { Button as AjnaButton } from "@/components/button";
import { cn } from "@/utils";

const navigationClasses =
  "m-0 box-border inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 bg-transparent p-0 text-ajna-primary outline-none hover:bg-ajna-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ajna-ring";

interface CalendarBodyProps {
  todayLabel: string;
}

export function DateInputCalendar({
  todayLabel,
  ...props
}: CalendarBodyProps & { "aria-label": string }) {
  return (
    <Calendar
      {...props}
      data-ajna-component="date-input-calendar"
      data-slot="date-input-calendar"
      className="box-border w-[344px] max-w-full p-4 font-ajna text-base text-ajna-popover-foreground"
    >
      <CalendarBody todayLabel={todayLabel} />
    </Calendar>
  );
}

function CalendarBody({ todayLabel }: CalendarBodyProps) {
  const state = useContext(CalendarStateContext)!;
  const pickerState = useContext(DatePickerStateContext)!;
  const currentDate = toCalendar(
    today(state.timeZone),
    state.focusedDate.calendar,
  );
  const todaySelected =
    pickerState.dateValue !== null &&
    isSameDay(pickerState.dateValue, currentDate);
  const todayDisabled =
    state.isDisabled ||
    state.isReadOnly ||
    state.isInvalid(currentDate) ||
    state.isCellUnavailable(currentDate);
  const [selectingYear, setSelectingYear] = useState(false);
  const panelId = useId();
  const yearsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (selectingYear)
      yearsRef.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.scrollIntoView?.({ block: "center" });
  }, [selectingYear]);
  return (
    <>
      <div
        data-ajna-component="date-input-calendar-header"
        className="mb-3 flex items-center gap-1"
      >
        <HeadingContext.Provider value={{}}>
          <CalendarHeading
            level={2}
            data-ajna-component="date-input-calendar-title"
            className="m-0 me-auto text-base"
            render={({ children, ...headingProps }) => (
              <h2 {...headingProps}>
                <Button
                  slot={null}
                  ref={headingRef}
                  aria-expanded={selectingYear}
                  aria-controls={panelId}
                  onPress={() => setSelectingYear(!selectingYear)}
                  data-ajna-component="date-input-calendar-heading"
                  className={cn(
                    "m-0 box-border inline-flex h-8 cursor-pointer items-center gap-1 rounded-ajna-sm border-0 bg-transparent px-0.5 py-0 font-ajna text-base font-semibold text-ajna-popover-foreground outline-none hover:bg-ajna-accent data-[focus-visible]:ring-2 data-[focus-visible]:ring-ajna-ring",
                    selectingYear && "text-ajna-primary",
                  )}
                >
                  {children}
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    data-ajna-component="date-input-calendar-chevron"
                    className={cn(
                      "text-ajna-primary",
                      selectingYear ? "rotate-90" : "rtl:rotate-180",
                    )}
                  />
                </Button>
              </h2>
            )}
          />
        </HeadingContext.Provider>
        {!todaySelected && (
          <AjnaButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={todayDisabled}
            onClick={() => {
              state.setFocusedDate(currentDate);
              setSelectingYear(false);
              state.selectDate(currentDate);
              headingRef.current?.focus();
            }}
          >
            {todayLabel}
          </AjnaButton>
        )}
        {!selectingYear && (
          <>
            <Button
              slot="previous"
              data-ajna-component="date-input-calendar-previous"
              className={navigationClasses}
            >
              <ChevronLeft
                size={20}
                aria-hidden="true"
                data-ajna-component="date-input-calendar-chevron"
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              slot="next"
              data-ajna-component="date-input-calendar-next"
              className={navigationClasses}
            >
              <ChevronRight
                size={20}
                aria-hidden="true"
                data-ajna-component="date-input-calendar-chevron"
                className="rtl:rotate-180"
              />
            </Button>
          </>
        )}
      </div>
      <div id={panelId}>
        {selectingYear ? (
          <CalendarYearPicker visibleYears={200}>
            {({ items, value, onChange, "aria-label": label }) => {
              const years = items.map((item) => ({
                ...item,
                key: `${item.date.era}-${item.date.year}`,
              }));
              return (
                <ListBox
                  ref={yearsRef}
                  aria-label={label}
                  layout="grid"
                  selectionMode="single"
                  selectionBehavior="toggle"
                  disallowEmptySelection
                  selectedKeys={years
                    .filter((item) => item.id === value)
                    .map((item) => item.key)}
                  items={years}
                  data-ajna-component="date-input-years"
                  className="box-border grid h-[264px] grid-cols-3 content-start gap-x-2 gap-y-0.5 overflow-y-auto overscroll-contain rounded-ajna-base px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring"
                >
                  {(item) => (
                    <ListBoxItem
                      id={item.key}
                      textValue={item.formatted}
                      onPress={() => {
                        onChange(item.id);
                        setSelectingYear(false);
                        headingRef.current?.focus();
                      }}
                      data-ajna-component="date-input-year"
                      className="box-border flex h-11 min-w-0 cursor-pointer items-center justify-center rounded-ajna-base px-2 text-base tabular-nums outline-none hover:bg-ajna-accent data-[selected]:bg-ajna-primary data-[selected]:font-medium data-[selected]:text-ajna-primary-foreground data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ajna-ring"
                    >
                      {item.formatted}
                    </ListBoxItem>
                  )}
                </ListBox>
              );
            }}
          </CalendarYearPicker>
        ) : (
          <CalendarGrid
            weekdayStyle="short"
            data-ajna-component="date-input-calendar-grid"
            className="w-full table-fixed border-collapse [border-spacing:0] [&_td]:p-0 [&_th]:p-0"
          >
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell
                  data-ajna-component="date-input-weekday"
                  className="h-9 text-center text-sm font-normal text-ajna-muted-foreground"
                >
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  date={date}
                  data-ajna-component="date-input-day"
                  className={({ isToday, isSelected }) =>
                    cn(
                      "relative m-0 box-border flex h-11 w-full cursor-pointer items-center justify-center rounded-ajna-base border-0 bg-transparent p-0 text-base tabular-nums text-ajna-popover-foreground outline-none hover:bg-ajna-accent data-[disabled]:pointer-events-none data-[focus-visible]:z-10 data-[unavailable]:cursor-default data-[outside-month]:text-ajna-muted-foreground/50 data-[unavailable]:line-through data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ajna-ring",
                      isSelected &&
                        "bg-ajna-primary font-medium text-ajna-primary-foreground hover:bg-ajna-primary",
                      isToday &&
                        !isSelected &&
                        "bg-ajna-primary/10 font-medium text-ajna-primary",
                    )
                  }
                />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        )}
      </div>
    </>
  );
}
