"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type InputProps = ComponentPropsWithoutRef<typeof BaseInput>;

const inputClasses =
  "m-0 box-border block h-9 w-full min-w-0 rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 px-3 py-1 font-ajna text-base leading-5 text-ajna-foreground shadow-sm outline-none transition-[border-color,box-shadow] file:mr-3 file:h-7 file:border-0 file:bg-transparent file:font-ajna file:text-sm file:font-medium file:text-ajna-foreground placeholder:text-ajna-muted-foreground focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 disabled:cursor-not-allowed disabled:bg-ajna-muted disabled:opacity-50 md:text-sm motion-reduce:transition-none";

export const Input = forwardRef<HTMLElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <BaseInput
      {...props}
      ref={ref}
      data-ajna-component="input"
      data-slot="input"
      className={
        typeof className === "function"
          ? (state) => cn(inputClasses, className(state))
          : cn(inputClasses, className)
      }
    />
  );
});
Input.displayName = "Input";
