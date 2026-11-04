"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "outline"
  | "ghost"
  | "link";
export interface BadgeVariantProps {
  /** Visual emphasis. @default "default" */
  variant?: BadgeVariant;
}
export type BadgeProps = Omit<
  useRender.ComponentProps<"span", { slot: string; variant: BadgeVariant }>,
  "ref"
> &
  BadgeVariantProps;

const variants = {
  default: "border-transparent bg-ajna-primary text-ajna-primary-foreground",
  secondary:
    "border-transparent bg-ajna-secondary text-ajna-secondary-foreground",
  destructive:
    "border-transparent bg-ajna-destructive-tint text-ajna-destructive-text",
  success: "border-transparent bg-ajna-success-tint text-ajna-success",
  warning: "border-transparent bg-ajna-warning-tint text-ajna-warning",
  info: "border-transparent bg-ajna-info-tint text-ajna-info",
  outline: "border-ajna-border bg-transparent text-ajna-foreground",
  ghost:
    "border-transparent bg-transparent text-ajna-foreground [&:is(a):hover]:bg-ajna-accent",
  link: "border-transparent bg-transparent text-ajna-primary underline-offset-4 [&:is(a):hover]:underline",
};
const badgeStyles = cva(
  "m-0 box-border inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-solid px-2 py-0.5 font-ajna text-xs font-medium leading-4 no-underline outline-none transition-colors focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 motion-reduce:transition-none [&>svg]:pointer-events-none [&>svg]:h-3 [&>svg]:w-3",
  {
    variants: { variant: variants },
    defaultVariants: { variant: "default" },
  },
);
export function badgeVariants({ variant }: BadgeVariantProps = {}) {
  return cn(
    badgeStyles({
      variant,
    }),
  );
}
export const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge(
  { className, render, variant = "default", ...props },
  ref,
) {
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    state: { slot: "badge", variant },
    props: {
      ...props,
      "data-ajna-component": "badge",
      className: cn(badgeVariants({ variant }), className),
    },
  });
});
Badge.displayName = "Badge";
