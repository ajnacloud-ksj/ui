"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type SeparatorProps = ComponentPropsWithoutRef<typeof BaseSeparator>;
export type SeparatorOrientation = "horizontal" | "vertical";
const orientations = {
  horizontal: "h-px w-full",
  vertical: "w-px self-stretch",
};

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, orientation = "horizontal", ...props }, ref) {
    const classes = cn(
      "m-0 box-border shrink-0 border-0 bg-ajna-border p-0",
      orientations[orientation],
    );
    return (
      <BaseSeparator
        {...props}
        ref={ref}
        orientation={orientation}
        data-ajna-component="separator"
        data-slot="separator"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
Separator.displayName = "Separator";
