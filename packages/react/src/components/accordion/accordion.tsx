"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type RefAttributes,
} from "react";

import { cn } from "@/utils";

export type AccordionProps<Value = string> = Omit<
  BaseAccordion.Root.Props<Value>,
  "ref"
>;
export type AccordionItemProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Item
>;
export type AccordionTriggerProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Trigger
>;
export type AccordionContentProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Panel
>;

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps<unknown>>(
  function Accordion({ className, ...props }, ref) {
    const classes =
      "box-border flex w-full min-w-0 flex-col font-ajna text-ajna-foreground";
    return (
      <BaseAccordion.Root
        {...props}
        ref={ref}
        data-ajna-component="accordion"
        data-slot="accordion"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
AccordionRoot.displayName = "Accordion";
export const Accordion = AccordionRoot as <Value = string>(
  props: AccordionProps<Value> & RefAttributes<HTMLDivElement>,
) => ReactElement;

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, ...props }, ref) {
    const classes =
      "box-border min-w-0 border-0 border-b border-solid border-ajna-border last:border-b-0";
    return (
      <BaseAccordion.Item
        {...props}
        ref={ref}
        data-ajna-component="accordion-item"
        data-slot="accordion-item"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = forwardRef<HTMLElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, children, ...props }, ref) {
    const classes =
      "group/ajna-accordion-trigger m-0 box-border flex w-full flex-1 cursor-pointer items-start justify-between gap-4 rounded-ajna-sm border-0 bg-transparent px-0 py-4 font-ajna text-left text-sm font-medium leading-5 text-ajna-foreground outline-none [&:hover:not(:disabled):not([aria-disabled=true])]:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ajna-ring disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";
    return (
      <BaseAccordion.Header
        data-ajna-component="accordion-header"
        className="m-0 flex text-sm font-normal"
      >
        <BaseAccordion.Trigger
          {...props}
          ref={ref}
          data-ajna-component="accordion-trigger"
          data-slot="accordion-trigger"
          className={
            typeof className === "function"
              ? (state) => cn(classes, className(state))
              : cn(classes, className)
          }
        >
          {children}
          <ChevronDown
            aria-hidden="true"
            data-ajna-component="accordion-chevron"
            className="pointer-events-none mt-0.5 h-4 w-4 shrink-0 text-ajna-muted-foreground transition-transform duration-150 group-aria-expanded/ajna-accordion-trigger:rotate-180 motion-reduce:transition-none"
            focusable="false"
          />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(function AccordionContent({ className, children, ...props }, ref) {
  const classes =
    "h-[var(--accordion-panel-height)] overflow-hidden transition-[height,opacity] duration-150 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";
  return (
    <BaseAccordion.Panel
      {...props}
      ref={ref}
      data-ajna-component="accordion-content"
      data-slot="accordion-content"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      <div
        data-ajna-component="accordion-inner"
        className="pb-4 text-sm leading-6 text-ajna-muted-foreground [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-3 [&_p]:m-0"
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
});
AccordionContent.displayName = "AccordionContent";
