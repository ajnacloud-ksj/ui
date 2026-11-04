"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type SwitchSize = "default" | "sm";
export interface SwitchProps extends ComponentPropsWithoutRef<
  typeof BaseSwitch.Root
> {
  /** Visual size of the track and thumb. @default "default" */
  size?: SwitchSize;
}

const sizes = { default: "h-5 w-9", sm: "h-4 w-7" };
const switchStyles = cva(
  "relative m-0 box-border inline-flex shrink-0 cursor-pointer items-center rounded-full border border-solid border-transparent bg-ajna-input p-px align-middle outline-none transition-[background-color,border-color,box-shadow] duration-200 focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[checked]:bg-ajna-primary data-[disabled]:opacity-50 motion-reduce:transition-none",
  { variants: { size: sizes }, defaultVariants: { size: "default" } },
);

export const Switch = forwardRef<HTMLElement, SwitchProps>(function Switch(
  { className, children, size = "default", ...props },
  ref,
) {
  return (
    <BaseSwitch.Root
      {...props}
      ref={ref}
      data-ajna-component="switch"
      data-slot="switch"
      data-size={size}
      className={
        typeof className === "function"
          ? (state) => cn(switchStyles({ size }), className(state))
          : cn(switchStyles({ size }), className)
      }
    >
      <BaseSwitch.Thumb
        data-ajna-component="switch-thumb"
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none box-border block shrink-0 origin-left rounded-full bg-ajna-primary-foreground shadow-sm [transition:transform_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s] motion-reduce:transition-none rtl:origin-right [:is([role=switch],[data-slot=label],[data-slot=field-label]):active_&:not([data-disabled])]:motion-safe:rounded-[50%/55%] [:is([role=switch],[data-slot=label],[data-slot=field-label]):active_&:not([data-disabled])]:motion-safe:[scale:1.1_1]",
          size === "sm"
            ? "h-3 w-3 data-[checked]:origin-right data-[checked]:translate-x-3 rtl:data-[checked]:origin-left rtl:data-[checked]:-translate-x-3"
            : "h-4 w-4 data-[checked]:origin-right data-[checked]:translate-x-4 rtl:data-[checked]:origin-left rtl:data-[checked]:-translate-x-4",
        )}
      />
      {children}
    </BaseSwitch.Root>
  );
});
Switch.displayName = "Switch";
