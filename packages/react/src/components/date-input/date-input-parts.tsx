"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  DateSegment,
  I18nProvider,
  useLocale,
} from "react-aria-components";

import { cn } from "@/utils";

import type { DateInputSegmentProps } from "./date-input";

export const dateControlClasses =
  "box-border flex min-h-9 w-full min-w-0 items-center rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 font-ajna text-ajna-foreground shadow-sm transition-[border-color,box-shadow] focus-within:border-ajna-ring focus-within:ring-[3px] focus-within:ring-ajna-ring/50 data-[invalid]:border-ajna-destructive data-[invalid]:ring-[3px] data-[invalid]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:bg-ajna-muted data-[disabled]:opacity-50 motion-reduce:transition-none";

const inputClasses =
  "box-border flex min-h-8 min-w-0 flex-1 items-center px-2 py-1 font-ajna text-base leading-5 tabular-nums text-ajna-foreground md:text-sm";
const segmentClasses =
  "box-border rounded-ajna-sm px-0.5 py-0 font-ajna outline-none data-[placeholder]:text-ajna-muted-foreground data-[focused]:bg-ajna-primary data-[focused]:text-ajna-primary-foreground data-[type=literal]:px-0 data-[type=literal]:text-ajna-muted-foreground";

export function DateLocale({
  locale,
  children,
}: {
  locale?: string;
  children: ReactNode;
}) {
  return locale ? (
    <I18nProvider locale={locale}>
      <DateDirection>{children}</DateDirection>
    </I18nProvider>
  ) : (
    <DateDirection>{children}</DateDirection>
  );
}

export function DateSegments({
  className,
  segmentClassName,
  ...props
}: DateInputSegmentProps & { segmentClassName?: string }) {
  return (
    <AriaDateInput
      {...props}
      data-ajna-component="date-segments"
      data-slot="date-segments"
      className={(state) =>
        cn(
          inputClasses,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(segment) => (
        <DateSegment
          segment={segment}
          data-ajna-component="date-segment"
          data-slot="date-segment"
          className={cn(segmentClasses, segmentClassName)}
        />
      )}
    </AriaDateInput>
  );
}

export function DateClearButton({
  label,
  isDisabled,
  onClear,
}: {
  label: string;
  isDisabled: boolean;
  onClear: () => void;
}) {
  return (
    <AriaButton
      slot={null}
      type="button"
      aria-label={label}
      isDisabled={isDisabled}
      onPress={onClear}
      data-ajna-component="date-clear"
      data-slot="date-clear"
      className="m-0 me-0.5 box-border inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 bg-transparent p-0 text-ajna-muted-foreground outline-none hover:bg-ajna-accent hover:text-ajna-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ajna-ring"
    >
      <X size={16} aria-hidden="true" />
    </AriaButton>
  );
}

function DateDirection({ children }: { children: ReactNode }) {
  const { direction } = useLocale();
  return (
    <DirectionProvider direction={direction}>{children}</DirectionProvider>
  );
}
