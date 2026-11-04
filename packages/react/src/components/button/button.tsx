"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

type ButtonStyleProps = VariantProps<typeof buttonStyles>;
export type ButtonVariant = NonNullable<ButtonStyleProps["variant"]>;
export type ButtonSize = NonNullable<ButtonStyleProps["size"]>;
export type ButtonShape = NonNullable<ButtonStyleProps["shape"]>;

export interface ButtonVariantProps {
  /** Visual emphasis. @default "primary" */
  variant?: ButtonVariant;
  /** Control height and content spacing. @default "base" */
  size?: ButtonSize;
  /** Square and circular buttons require an accessible name. @default "base" */
  shape?: ButtonShape;
}

interface ButtonSharedProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  /** Shows a spinner, preserves the label, and prevents activation. */
  loading?: boolean;
  /** An icon element, rendered before the label. */
  icon?: ReactNode;
}

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type ButtonProps =
  | (ButtonSharedProps & { shape?: "base" })
  | (ButtonSharedProps & AccessibleName & { shape: "square" | "circle" });

const variants = {
  primary:
    "border border-black/[0.12] bg-ajna-primary text-ajna-primary-foreground bg-[linear-gradient(rgb(255_255_255_/_0.04),transparent)] shadow-[inset_0_1px_rgb(255_255_255_/_0.16),0_1px_2px_rgb(0_0_0_/_0.1)] [&:hover:not(:disabled)]:bg-[linear-gradient(rgb(0_0_0_/_0.08),rgb(0_0_0_/_0.08))]",
  secondary:
    "border border-ajna-border bg-ajna-secondary text-ajna-secondary-foreground [&:hover:not(:disabled)]:bg-ajna-accent",
  ghost:
    "bg-transparent text-ajna-foreground shadow-none [&:hover:not(:disabled)]:bg-ajna-accent",
  destructive:
    "border border-black/[0.12] bg-ajna-destructive text-ajna-destructive-foreground bg-[linear-gradient(rgb(255_255_255_/_0.04),transparent)] [&:hover:not(:disabled)]:bg-[linear-gradient(rgb(0_0_0_/_0.08),rgb(0_0_0_/_0.08))]",
  "secondary-destructive":
    "border border-ajna-border bg-ajna-secondary text-ajna-destructive-text [&:hover:not(:disabled)]:border-ajna-destructive",
  outline:
    "border border-ajna-border bg-transparent text-ajna-foreground [&:hover:not(:disabled)]:bg-ajna-accent",
};

const sizes = {
  xs: "h-5 gap-1 px-1.5 text-xs leading-4 rounded-ajna-sm",
  sm: "h-[1.625rem] gap-1 px-2 text-xs leading-4 rounded-ajna-md",
  base: "h-9 gap-1.5 px-3 text-sm leading-5 rounded-ajna-base",
  lg: "h-10 gap-2 px-4 text-sm leading-5 rounded-ajna-base",
};

const shapes = {
  base: null,
  square: "px-0",
  circle: "px-0 rounded-full",
};

const defaults = { variant: "primary", size: "base", shape: "base" } as const;

const buttonStyles = cva(
  "relative m-0 box-border inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap border-0 border-solid py-0 align-middle font-ajna font-medium no-underline shadow-[0_1px_2px_rgb(0_0_0_/_0.05)] outline outline-2 outline-offset-[3px] outline-transparent transition-[background-color,border-color,color,box-shadow] duration-[120ms] ease-linear focus:outline-ajna-ring disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none supports-[selector(:focus-visible)]:[&:focus:not(:focus-visible)]:outline-transparent",
  {
    variants: { variant: variants, size: sizes, shape: shapes },
    defaultVariants: defaults,
    compoundVariants: [
      { shape: ["square", "circle"], size: "xs", class: "w-5" },
      { shape: ["square", "circle"], size: "sm", class: "w-[1.625rem]" },
      { shape: ["square", "circle"], size: "base", class: "w-9" },
      { shape: ["square", "circle"], size: "lg", class: "w-10" },
    ],
  },
);

export function buttonVariants({
  variant,
  size,
  shape,
}: ButtonVariantProps = {}) {
  return cn(
    buttonStyles({
      variant,
      size,
      shape,
    }),
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "base",
      shape = "base",
      loading = false,
      disabled,
      icon,
      children,
      className,
      type = "button",
      "aria-busy": ariaBusy,
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        disabled={disabled || loading}
        aria-busy={loading || ariaBusy || undefined}
        data-ajna-component="button"
        data-loading={loading ? "" : undefined}
      >
        {loading ? (
          <Spinner
            size={14}
            className="h-[0.875em] w-[0.875em] flex-none"
            aria-hidden="true"
          />
        ) : icon ? (
          <span
            data-ajna-component="button-icon"
            className="inline-flex flex-none items-center justify-center [&>svg]:h-[1em] [&>svg]:w-[1em]"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
