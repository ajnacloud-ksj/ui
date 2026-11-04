"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { forwardRef, type ReactElement, type RefAttributes } from "react";

import { cn } from "@/utils";

export type RadioGroupProps<Value = string> = Omit<
  BaseRadioGroup.Props<Value>,
  "ref"
>;
export type RadioGroupItemProps<Value = string> = Omit<
  BaseRadio.Root.Props<Value>,
  "ref"
>;

const groupClasses =
  "box-border grid w-full min-w-0 gap-2 font-ajna text-ajna-foreground";
const itemClasses =
  "relative m-0 box-border inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-solid border-ajna-input bg-ajna-background p-0 align-middle text-ajna-foreground shadow-sm outline-none transition-[background-color,border-color,box-shadow] data-[checked]:border-ajna-primary data-[checked]:bg-ajna-primary data-[checked]:text-ajna-primary-foreground focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 motion-reduce:transition-none";

const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupProps<unknown>>(
  function RadioGroup({ className, ...props }, ref) {
    return (
      <BaseRadioGroup
        {...props}
        ref={ref}
        data-ajna-component="radio-group"
        data-slot="radio-group"
        className={
          typeof className === "function"
            ? (state) => cn(groupClasses, className(state))
            : cn(groupClasses, className)
        }
      />
    );
  },
);
RadioGroupRoot.displayName = "RadioGroup";
export const RadioGroup = RadioGroupRoot as <Value = string>(
  props: RadioGroupProps<Value> & RefAttributes<HTMLDivElement>,
) => ReactElement;

const RadioGroupItemRoot = forwardRef<
  HTMLElement,
  RadioGroupItemProps<unknown>
>(function RadioGroupItem({ className, children, ...props }, ref) {
  return (
    <BaseRadio.Root
      {...props}
      ref={ref}
      data-ajna-component="radio-group-item"
      data-slot="radio-group-item"
      className={
        typeof className === "function"
          ? (state) => cn(itemClasses, className(state))
          : cn(itemClasses, className)
      }
    >
      <BaseRadio.Indicator
        data-ajna-component="radio-group-indicator"
        data-slot="radio-group-indicator"
        className="flex h-full w-full items-center justify-center"
      >
        <span
          aria-hidden="true"
          data-ajna-component="radio-group-dot"
          className="block h-2 w-2 rounded-full bg-current"
        />
      </BaseRadio.Indicator>
      {children}
    </BaseRadio.Root>
  );
});
RadioGroupItemRoot.displayName = "RadioGroupItem";
export const RadioGroupItem = RadioGroupItemRoot as <Value = string>(
  props: RadioGroupItemProps<Value> & RefAttributes<HTMLElement>,
) => ReactElement;
