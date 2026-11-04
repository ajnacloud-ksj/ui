"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

const sizes = { sm: 16, base: 24, lg: 32 } as const;
export type SpinnerSize = keyof typeof sizes | number;

export interface SpinnerProps extends Omit<
  ComponentPropsWithoutRef<"svg">,
  "children" | "width" | "height"
> {
  /** Preset size or a positive pixel value. @default "base" */
  size?: SpinnerSize;
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  {
    size = "base",
    className,
    role = "status",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-hidden": ariaHidden,
    ...props
  },
  ref,
) {
  const dimension =
    typeof size === "number"
      ? Number.isFinite(size) && size > 0
        ? size
        : sizes.base
      : sizes[size];
  const decorative = ariaHidden === true || ariaHidden === "true";
  return (
    <svg
      {...props}
      ref={ref}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      focusable="false"
      role={decorative ? undefined : role}
      aria-label={
        decorative
          ? undefined
          : (ariaLabel ?? (ariaLabelledby ? undefined : "Loading"))
      }
      aria-labelledby={decorative ? undefined : ariaLabelledby}
      aria-hidden={ariaHidden}
      data-ajna-component="spinner"
      data-slot="spinner"
      className={cn("inline-block shrink-0 align-middle", className)}
    >
      <circle cx="12" cy="12" r="9.5" opacity="0.1" />
      <g
        data-ajna-component="spinner-rotation"
        className="origin-center animate-ajna-spinner-rotate motion-reduce:animate-none"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          strokeDasharray="42 150"
          strokeDashoffset="-16"
          data-ajna-component="spinner-arc"
          className="animate-ajna-spinner-dash motion-reduce:animate-none"
        />
      </g>
    </svg>
  );
});
Spinner.displayName = "Spinner";
