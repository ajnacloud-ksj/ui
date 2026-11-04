"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type CheckboxProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Root>;

const checkboxClasses =
  "relative m-0 box-border inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border border-solid border-ajna-input bg-ajna-background p-0 align-middle font-ajna text-ajna-foreground shadow-sm outline-none transition-[background-color,border-color,box-shadow] data-[checked]:border-ajna-primary data-[checked]:bg-ajna-primary data-[checked]:text-ajna-primary-foreground data-[indeterminate]:border-ajna-primary data-[indeterminate]:bg-ajna-primary data-[indeterminate]:text-ajna-primary-foreground focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 motion-reduce:transition-none";

export const Checkbox = forwardRef<HTMLElement, CheckboxProps>(
  function Checkbox({ className, children, ...props }, ref) {
    return (
      <BaseCheckbox.Root
        {...props}
        ref={ref}
        data-ajna-component="checkbox"
        data-slot="checkbox"
        className={
          typeof className === "function"
            ? (state) => cn(checkboxClasses, className(state))
            : cn(checkboxClasses, className)
        }
      >
        <BaseCheckbox.Indicator
          data-ajna-component="checkbox-indicator"
          data-slot="checkbox-indicator"
          className="flex h-full w-full items-center justify-center text-current"
          render={(indicatorProps, state) => {
            const Icon = state.indeterminate ? Minus : Check;
            return (
              <span {...indicatorProps}>
                <Icon
                  data-ajna-component="checkbox-icon"
                  className="block h-3.5 w-3.5"
                  aria-hidden="true"
                  focusable="false"
                />
              </span>
            );
          }}
        />
        {children}
      </BaseCheckbox.Root>
    );
  },
);
Checkbox.displayName = "Checkbox";
