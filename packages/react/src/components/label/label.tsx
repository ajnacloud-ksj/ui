"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type LabelProps = ComponentPropsWithoutRef<"label">;
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, htmlFor, children, ...props },
  ref,
) {
  return (
    <label
      htmlFor={htmlFor}
      children={children}
      {...props}
      ref={ref}
      data-ajna-component="label"
      data-slot="label"
      className={cn(
        "box-border inline-flex select-none items-center gap-2 font-ajna text-sm font-medium leading-5 text-ajna-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
        className,
      )}
    />
  );
});
Label.displayName = "Label";
