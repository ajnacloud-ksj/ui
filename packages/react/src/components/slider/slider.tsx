"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type RefAttributes,
} from "react";

import { cn } from "@/utils";

export type SliderThumbProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSlider.Thumb>,
  "index" | "children"
>;
export type SliderProps<Value extends number | readonly number[] = number> =
  Omit<BaseSlider.Root.Props<Value>, "ref"> & {
    /** Props shared by all thumbs, or selected by thumb index. */
    thumbProps?: SliderThumbProps | ((index: number) => SliderThumbProps);
  };
export type SliderLabelProps = ComponentPropsWithoutRef<
  typeof BaseSlider.Label
>;
export type SliderValueProps = ComponentPropsWithoutRef<
  typeof BaseSlider.Value
>;

const rootClasses =
  "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 font-ajna text-sm leading-5 text-ajna-foreground data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col";
const thumbClasses =
  "box-border block h-4 w-4 shrink-0 rounded-full border border-solid border-ajna-primary bg-ajna-background shadow-sm outline-none transition-[box-shadow,border-color] focus-within:ring-[3px] focus-within:ring-ajna-ring/50 data-[invalid]:border-ajna-destructive data-[invalid]:focus-within:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed motion-reduce:transition-none";

const SliderRoot = forwardRef<
  HTMLDivElement,
  SliderProps<number | readonly number[]>
>(function Slider(
  {
    className,
    children,
    orientation = "horizontal",
    thumbAlignment = "edge",
    thumbProps,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  return (
    <BaseSlider.Root
      {...props}
      ref={ref}
      orientation={orientation}
      thumbAlignment={thumbAlignment}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-ajna-component="slider"
      data-slot="slider"
      className={
        typeof className === "function"
          ? (state) => cn(rootClasses, className(state))
          : cn(rootClasses, className)
      }
    >
      {children}
      <BaseSlider.Control
        data-ajna-component="slider-control"
        data-slot="slider-control"
        className="relative flex min-h-5 w-full cursor-pointer touch-none select-none items-center data-[orientation=vertical]:min-h-0 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-1 data-[disabled]:cursor-not-allowed data-[orientation=vertical]:flex-col data-[disabled]:opacity-50"
        render={(controlProps, state) => (
          <div {...controlProps}>
            <BaseSlider.Track
              data-ajna-component="slider-track"
              data-slot="slider-track"
              className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-ajna-muted data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            >
              <BaseSlider.Indicator
                data-ajna-component="slider-indicator"
                data-slot="slider-indicator"
                className="rounded-[inherit] bg-ajna-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
              />
            </BaseSlider.Track>
            {state.values.map((_, index) => {
              const options =
                typeof thumbProps === "function"
                  ? thumbProps(index)
                  : thumbProps;
              const thumbClassName = options?.className;
              return (
                <BaseSlider.Thumb
                  {...options}
                  key={index}
                  index={index}
                  aria-label={options?.["aria-label"] ?? ariaLabel}
                  aria-describedby={
                    options?.["aria-describedby"] ?? ariaDescribedBy
                  }
                  data-ajna-component="slider-thumb"
                  data-slot="slider-thumb"
                  className={
                    typeof thumbClassName === "function"
                      ? (thumbState) =>
                          cn(thumbClasses, thumbClassName(thumbState))
                      : cn(thumbClasses, thumbClassName)
                  }
                />
              );
            })}
          </div>
        )}
      />
    </BaseSlider.Root>
  );
});
SliderRoot.displayName = "Slider";
export const Slider = SliderRoot as <
  Value extends number | readonly number[] = number,
>(
  props: SliderProps<Value> & RefAttributes<HTMLDivElement>,
) => ReactElement;

export const SliderLabel = forwardRef<HTMLDivElement, SliderLabelProps>(
  function SliderLabel({ className, ...props }, ref) {
    const classes =
      "font-ajna text-sm font-medium leading-5 text-ajna-foreground data-[disabled]:opacity-50 data-[invalid]:text-ajna-destructive-text";
    return (
      <BaseSlider.Label
        {...props}
        ref={ref}
        data-ajna-component="slider-label"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
SliderLabel.displayName = "SliderLabel";

export const SliderValue = forwardRef<HTMLOutputElement, SliderValueProps>(
  function SliderValue({ className, ...props }, ref) {
    const classes =
      "ms-auto font-ajna text-sm leading-5 tabular-nums text-ajna-muted-foreground";
    return (
      <BaseSlider.Value
        {...props}
        ref={ref}
        data-ajna-component="slider-value"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
SliderValue.displayName = "SliderValue";
