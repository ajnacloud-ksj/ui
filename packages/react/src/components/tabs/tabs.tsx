"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { createContext, forwardRef, useContext } from "react";

import { cn } from "@/utils";

export type TabsVariant = "segmented" | "underline";
export type TabsSize = "sm" | "base";
export type TabsProps = BaseTabs.Root.Props;
export type TabsListProps = BaseTabs.List.Props & {
  /** Visual style of the tab bar. @default "segmented" */
  variant?: TabsVariant;
  /** Height of the tab bar or vertical list items. @default "base" */
  size?: TabsSize;
  /** Additional utility classes for the built-in active indicator. */
  indicatorClassName?: string;
};
export type TabsTriggerProps = BaseTabs.Tab.Props;
export type TabsContentProps = BaseTabs.Panel.Props;

const TabsStyleContext = createContext<{
  variant: TabsVariant;
  size: TabsSize;
}>({
  variant: "segmented",
  size: "base",
});

const listStyles = cva(
  "relative isolate m-0 box-border inline-flex w-fit min-w-0 max-w-full shrink-0 border-solid font-ajna text-ajna-muted-foreground",
  {
    variants: {
      variant: {
        segmented:
          "gap-0 rounded-ajna-base border-0 bg-ajna-muted p-0.5 ring-1 ring-inset ring-ajna-border",
        underline: "gap-1 border-0 border-ajna-border bg-transparent p-0",
      },
      orientation: {
        horizontal:
          "items-center overflow-x-auto overflow-y-hidden overscroll-x-contain",
        vertical: "flex-col items-stretch",
      },
      size: { sm: "text-xs", base: "text-sm" },
    },
    compoundVariants: [
      { orientation: "horizontal", size: "base", class: "min-h-9" },
      { orientation: "horizontal", size: "sm", class: "min-h-[1.625rem]" },
      { variant: "underline", orientation: "horizontal", class: "border-b" },
      { variant: "underline", orientation: "vertical", class: "border-s" },
    ],
  },
);
const triggerStyles = cva(
  "relative z-10 m-0 box-border inline-flex shrink-0 cursor-pointer select-none appearance-none items-center justify-center whitespace-nowrap border-0 border-solid bg-transparent py-0 font-ajna font-medium text-ajna-muted-foreground no-underline outline-none transition-colors hover:text-ajna-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring data-[disabled]:cursor-not-allowed data-[active]:text-ajna-foreground data-[disabled]:opacity-50 motion-reduce:transition-none [&>svg]:pointer-events-none [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        segmented: "rounded-ajna-md",
        underline: "rounded-ajna-sm data-[active]:text-ajna-primary",
      },
      size: {
        sm: "h-[1.375rem] gap-1 px-2 text-xs leading-4",
        base: "h-8 gap-1.5 px-2.5 text-sm leading-5",
      },
      orientation: {
        horizontal: "text-center",
        vertical: "w-full justify-start text-start",
      },
    },
    compoundVariants: [
      { variant: "underline", size: "base", class: "h-9" },
      { variant: "underline", size: "sm", class: "h-[1.625rem]" },
      {
        variant: "underline",
        orientation: "horizontal",
        size: "base",
        class: "h-[calc(2.25rem-1px)]",
      },
      {
        variant: "underline",
        orientation: "horizontal",
        size: "sm",
        class: "h-[calc(1.625rem-1px)]",
      },
    ],
  },
);
const indicatorStyles = cva(
  "pointer-events-none absolute z-0 box-border transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      variant: {
        segmented:
          "left-0 top-0 h-[var(--active-tab-height)] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-[var(--active-tab-top)] rounded-ajna-md border border-solid border-ajna-border bg-ajna-background shadow-sm",
        underline: "bg-ajna-primary",
      },
      orientation: { horizontal: "", vertical: "" },
    },
    compoundVariants: [
      {
        variant: "underline",
        orientation: "horizontal",
        class:
          "left-0 top-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-[calc(var(--active-tab-top)+var(--active-tab-height)-1px)]",
      },
      {
        variant: "underline",
        orientation: "vertical",
        class:
          "start-0 top-0 h-[var(--active-tab-height)] w-0.5 translate-y-[var(--active-tab-top)]",
      },
    ],
  },
);

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Root
      {...props}
      ref={ref}
      data-ajna-component="tabs"
      data-slot="tabs"
      className={(state) =>
        cn(
          "box-border flex min-w-0 max-w-full gap-3 font-ajna text-ajna-foreground",
          state.orientation === "vertical"
            ? "flex-row items-start"
            : "flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
});
Tabs.displayName = "Tabs";

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList(
    {
      variant = "segmented",
      size = "base",
      className,
      indicatorClassName,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <TabsStyleContext.Provider value={{ variant, size }}>
        <BaseTabs.List
          {...props}
          ref={ref}
          data-ajna-component="tabs-list"
          data-slot="tabs-list"
          data-variant={variant}
          data-size={size}
          className={(state) =>
            cn(
              listStyles({
                variant,
                size,
                orientation: state.orientation,
              }),
              typeof className === "function" ? className(state) : className,
            )
          }
        >
          {children}
          <BaseTabs.Indicator
            aria-hidden="true"
            data-ajna-component="tabs-indicator"
            data-slot="tabs-indicator"
            className={(state) =>
              cn(
                indicatorStyles({
                  variant,
                  orientation: state.orientation,
                }),
                indicatorClassName,
              )
            }
          />
        </BaseTabs.List>
      </TabsStyleContext.Provider>
    );
  },
);
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<HTMLElement, TabsTriggerProps>(
  function TabsTrigger({ className, ...props }, ref) {
    const { variant, size } = useContext(TabsStyleContext);
    return (
      <BaseTabs.Tab
        {...props}
        ref={ref}
        data-ajna-component="tabs-trigger"
        data-slot="tabs-trigger"
        data-variant={variant}
        data-size={size}
        className={(state) =>
          cn(
            triggerStyles({ variant, size, orientation: state.orientation }),
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        tabIndex={-1}
        {...props}
        ref={ref}
        data-ajna-component="tabs-content"
        data-slot="tabs-content"
        className={(state) =>
          cn(
            "box-border min-w-0 flex-1 rounded-ajna-sm font-ajna text-sm leading-6 text-ajna-foreground outline-none focus-visible:ring-2 focus-visible:ring-ajna-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ajna-background",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    );
  },
);
TabsContent.displayName = "TabsContent";
