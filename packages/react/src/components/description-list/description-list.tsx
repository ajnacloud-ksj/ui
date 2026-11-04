"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  useContext,
} from "react";

import { cn } from "@/utils";

export type DescriptionListOrientation = "stacked" | "horizontal";
export interface DescriptionListProps extends ComponentPropsWithoutRef<"dl"> {
  /** Horizontal groups stack on narrow screens. @default "stacked" */
  orientation?: DescriptionListOrientation;
}
const OrientationContext = createContext<DescriptionListOrientation>("stacked");

/** Semantic read-only label/value pairs. Group each pair with DescriptionGroup. */
export const DescriptionList = forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(function DescriptionList(
  { orientation = "stacked", className, ...props },
  ref,
) {
  const resolvedOrientation =
    orientation === "horizontal" ? "horizontal" : "stacked";
  return (
    <OrientationContext.Provider value={resolvedOrientation}>
      <dl
        {...props}
        ref={ref}
        data-ajna-component="description-list"
        data-slot="description-list"
        data-orientation={resolvedOrientation}
        className={cn(
          "m-0 grid min-w-0 gap-4 font-ajna text-sm leading-5 text-ajna-foreground",
          className,
        )}
      />
    </OrientationContext.Provider>
  );
});
export const DescriptionGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function DescriptionGroup({ className, ...props }, ref) {
  const orientation = useContext(OrientationContext);
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="description-group"
      data-slot="description-group"
      className={cn(
        "grid min-w-0 gap-1.5",
        orientation === "horizontal" &&
          "sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-x-6",
        className,
      )}
    />
  );
});
export const DescriptionTerm = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"dt">
>(function DescriptionTerm({ className, ...props }, ref) {
  return (
    <dt
      {...props}
      ref={ref}
      data-ajna-component="description-term"
      data-slot="description-term"
      className={cn(
        "m-0 min-w-0 break-words text-sm font-medium text-ajna-muted-foreground",
        className,
      )}
    />
  );
});
export const DescriptionDetail = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"dd">
>(function DescriptionDetail({ className, ...props }, ref) {
  return (
    <dd
      {...props}
      ref={ref}
      data-ajna-component="description-detail"
      data-slot="description-detail"
      className={cn(
        "m-0 min-w-0 whitespace-pre-wrap break-words text-sm text-ajna-foreground",
        className,
      )}
    />
  );
});
