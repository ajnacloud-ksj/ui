"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type CollapsibleProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Root
>;
export type CollapsibleTriggerProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Trigger
>;
export type CollapsibleContentProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Panel
>;

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible({ className, ...props }, ref) {
    const classes = "box-border font-ajna text-ajna-foreground";
    return (
      <BaseCollapsible.Root
        {...props}
        ref={ref}
        data-ajna-component="collapsible"
        data-slot="collapsible"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
Collapsible.displayName = "Collapsible";
export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(props, ref) {
  return (
    <BaseCollapsible.Trigger
      {...props}
      ref={ref}
      data-ajna-component="collapsible-trigger"
      data-slot="collapsible-trigger"
    />
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";
export const CollapsibleContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent({ className, ...props }, ref) {
  const classes =
    "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height,opacity] duration-150 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";
  return (
    <BaseCollapsible.Panel
      {...props}
      ref={ref}
      data-ajna-component="collapsible-content"
      data-slot="collapsible-content"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
CollapsibleContent.displayName = "CollapsibleContent";
