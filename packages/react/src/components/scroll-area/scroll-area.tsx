"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { forwardRef } from "react";

import { cn } from "@/utils";

export interface ScrollAreaProps extends BaseScrollArea.Root.Props {
  /** Fade overflowing edges. Defaults to true. */
  fade?: boolean;
  orientation?: "vertical" | "horizontal" | "both";
  viewportProps?: BaseScrollArea.Viewport.Props;
}
export type ScrollBarProps = BaseScrollArea.Scrollbar.Props;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      className,
      children,
      fade = true,
      orientation = "vertical",
      viewportProps,
      ...props
    },
    ref,
  ) {
    const direction = useDirection();
    const viewportClassName = viewportProps?.className;
    const classes =
      "relative box-border overflow-hidden has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ajna-ring font-ajna text-ajna-foreground";
    const viewportClasses = cn(
      "h-full w-full rounded-[inherit] outline-none motion-reduce:scroll-auto",
      fade &&
        "[mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start,0px)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,0px))),transparent_100%),linear-gradient(to_right,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start,0px)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,0px))),transparent_100%)] [mask-repeat:no-repeat]",
      fade &&
        direction === "rtl" &&
        "[mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start,0px)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,0px))),transparent_100%),linear-gradient(to_left,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start,0px)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,0px))),transparent_100%)]",
    );
    return (
      <BaseScrollArea.Root
        {...props}
        ref={ref}
        data-slot="scroll-area"
        data-ajna-component="scroll-area"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        <BaseScrollArea.Viewport
          {...viewportProps}
          data-slot="scroll-area-viewport"
          data-ajna-component="scroll-area-viewport"
          data-fade={fade || undefined}
          className={
            typeof viewportClassName === "function"
              ? (state) => cn(viewportClasses, viewportClassName(state))
              : cn(viewportClasses, viewportClassName)
          }
        >
          <BaseScrollArea.Content
            data-slot="scroll-area-content"
            data-ajna-component="scroll-area-content"
          >
            {children}
          </BaseScrollArea.Content>
        </BaseScrollArea.Viewport>
        {orientation !== "horizontal" && <ScrollBar />}
        {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
        <BaseScrollArea.Corner
          data-slot="scroll-area-corner"
          data-ajna-component="scroll-area-corner"
          className="bg-ajna-background"
        />
      </BaseScrollArea.Root>
    );
  },
);

export const ScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>(
  function ScrollBar({ className, orientation = "vertical", ...props }, ref) {
    const classes = cn(
      "z-10 flex touch-none select-none p-0.5 opacity-0 transition-opacity duration-150 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 motion-reduce:transition-none",
      orientation === "vertical" ? "w-2.5" : "h-2.5 flex-col",
    );
    return (
      <BaseScrollArea.Scrollbar
        {...props}
        ref={ref}
        orientation={orientation}
        data-slot="scroll-area-scrollbar"
        data-ajna-component="scroll-area-scrollbar"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        <BaseScrollArea.Thumb
          data-slot="scroll-area-thumb"
          data-ajna-component="scroll-area-thumb"
          className="relative flex-1 rounded-full bg-ajna-border"
        />
      </BaseScrollArea.Scrollbar>
    );
  },
);
