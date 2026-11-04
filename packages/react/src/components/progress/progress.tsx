"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export interface ProgressProps extends ComponentPropsWithoutRef<
  typeof BaseProgress.Root
> {
  trackClassName?: string;
  indicatorClassName?: string;
}
export type ProgressLabelProps = ComponentPropsWithoutRef<
  typeof BaseProgress.Label
>;
export type ProgressValueProps = ComponentPropsWithoutRef<
  typeof BaseProgress.Value
>;

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      className,
      trackClassName,
      indicatorClassName,
      children,
      value,
      ...props
    },
    ref,
  ) {
    const indeterminate = value == null || !Number.isFinite(value);
    const classes =
      "flex w-full flex-wrap items-center gap-x-3 gap-y-2 font-ajna text-sm leading-5 text-ajna-foreground";
    return (
      <BaseProgress.Root
        {...props}
        value={value}
        ref={ref}
        data-ajna-component="progress"
        data-slot="progress"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children}
        <BaseProgress.Track
          data-ajna-component="progress-track"
          data-slot="progress-track"
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-ajna-muted",
            trackClassName,
          )}
        >
          {indeterminate ? (
            [0, 1].map((index) => (
              <span
                key={index}
                data-ajna-component="progress-sweep"
                data-slot="progress-sweep"
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 animate-ajna-progress-travel rounded-[inherit] motion-reduce:animate-none",
                  index === 1 &&
                    "[animation-delay:1.1s] [animation-timing-function:cubic-bezier(0.2,0,0.4,1)] motion-reduce:hidden",
                )}
              >
                <BaseProgress.Indicator
                  data-ajna-component="progress-indicator"
                  data-slot="progress-indicator"
                  className={cn(
                    "h-full w-full origin-left animate-ajna-progress-stretch rounded-[inherit] bg-ajna-primary motion-reduce:mx-auto motion-reduce:w-1/3 motion-reduce:animate-none",
                    index === 1 &&
                      "animate-ajna-progress-stretch-secondary [animation-delay:1.1s]",
                    indicatorClassName,
                  )}
                />
              </span>
            ))
          ) : (
            <BaseProgress.Indicator
              data-ajna-component="progress-indicator"
              data-slot="progress-indicator"
              className={cn(
                "h-full rounded-[inherit] bg-ajna-primary transition-[width] duration-200 ease-out motion-reduce:transition-none",
                indicatorClassName,
              )}
            />
          )}
        </BaseProgress.Track>
      </BaseProgress.Root>
    );
  },
);
Progress.displayName = "Progress";

export const ProgressLabel = forwardRef<HTMLSpanElement, ProgressLabelProps>(
  function ProgressLabel({ className, ...props }, ref) {
    const classes =
      "font-ajna text-sm font-medium leading-5 text-ajna-foreground";
    return (
      <BaseProgress.Label
        {...props}
        ref={ref}
        data-ajna-component="progress-label"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ProgressLabel.displayName = "ProgressLabel";

export const ProgressValue = forwardRef<HTMLSpanElement, ProgressValueProps>(
  function ProgressValue({ className, ...props }, ref) {
    const classes =
      "ms-auto font-ajna text-sm leading-5 tabular-nums text-ajna-muted-foreground";
    return (
      <BaseProgress.Value
        {...props}
        ref={ref}
        data-ajna-component="progress-value"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ProgressValue.displayName = "ProgressValue";
