"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cva } from "class-variance-authority";
import { forwardRef, type ReactElement, type RefAttributes } from "react";

import { cn } from "@/utils";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "base" | "lg";
export interface ToggleVariantProps {
  variant?: ToggleVariant;
  size?: ToggleSize;
}
export type ToggleProps<Value extends string = string> = Omit<
  BaseToggle.Props<Value>,
  "ref"
> &
  ToggleVariantProps;

const variants = {
  default: "border-transparent bg-transparent",
  outline: "border-ajna-input bg-transparent shadow-sm",
};
const sizes = {
  sm: "h-8 min-w-8 gap-1 px-2 text-xs leading-4",
  base: "h-9 min-w-9 gap-1.5 px-2.5 text-sm leading-5",
  lg: "h-10 min-w-10 gap-2 px-3 text-sm leading-5",
};
const styles = cva(
  "m-0 box-border inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-ajna-base border border-solid py-0 align-middle font-ajna font-medium text-ajna-foreground outline-none transition-[background-color,border-color,color,box-shadow] hover:bg-ajna-muted focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 data-[disabled]:pointer-events-none data-[pressed]:bg-ajna-accent data-[pressed]:text-ajna-accent-foreground data-[disabled]:opacity-50 motion-reduce:transition-none [&>svg]:pointer-events-none [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: { variant: variants, size: sizes },
    defaultVariants: { variant: "default", size: "base" },
  },
);

export function toggleVariants({ variant, size }: ToggleVariantProps = {}) {
  return cn(
    styles({
      variant,
      size,
    }),
  );
}

const ToggleRoot = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { variant = "default", size = "base", className, ...props },
  ref,
) {
  const classes = toggleVariants({
    variant,
    size,
  });
  return (
    <BaseToggle
      {...props}
      ref={ref}
      data-ajna-component="toggle"
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ToggleRoot.displayName = "Toggle";
export const Toggle = ToggleRoot as <Value extends string = string>(
  props: ToggleProps<Value> & RefAttributes<HTMLButtonElement>,
) => ReactElement;
