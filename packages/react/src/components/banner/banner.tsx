"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useId,
} from "react";

import { Button, type ButtonProps } from "@/components/button";
import { cn } from "@/utils";

export type BannerVariant =
  "info" | "success" | "warning" | "destructive" | "neutral";
export type BannerSize = "base" | "sm";
export interface BannerVariantProps {
  variant?: BannerVariant;
  size?: BannerSize;
}
export interface BannerProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "title" | "children">,
    BannerVariantProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}
export type BannerActionVariant = "primary" | "secondary" | "ghost";
type ActionProps<Props> = Props extends ButtonProps
  ? Omit<Props, "variant" | "size"> & {
      variant?: BannerActionVariant;
      size?: "xs" | "sm";
    }
  : never;
export type BannerActionProps = ActionProps<ButtonProps>;

const variants = {
  info: "bg-ajna-info-tint text-ajna-info",
  success: "bg-ajna-success-tint text-ajna-success",
  warning: "bg-ajna-warning-tint text-ajna-warning",
  destructive: "bg-ajna-destructive-tint text-ajna-destructive-text",
  neutral: "bg-ajna-muted text-ajna-foreground",
};
const sizes = {
  base: "gap-3 rounded-ajna-base px-4 py-3",
  sm: "gap-2 rounded-ajna-md px-3 py-2",
};
const bannerStyles = cva(
  "box-border flex w-full min-w-0 items-start font-ajna text-sm leading-5",
  {
    variants: { variant: variants, size: sizes },
    defaultVariants: { variant: "info", size: "base" },
  },
);
export function bannerVariants({ variant, size }: BannerVariantProps = {}) {
  return cn(
    bannerStyles({
      variant,
      size,
    }),
  );
}
const ActionContext = createContext<{
  variant: BannerVariant;
  size: "xs" | "sm";
}>({ variant: "info", size: "sm" });
const primaryActions: Record<BannerVariant, string> = {
  info: "[&:hover:not(:disabled)]:bg-ajna-info bg-ajna-info text-ajna-background",
  success:
    "[&:hover:not(:disabled)]:bg-ajna-success bg-ajna-success text-ajna-background",
  warning:
    "[&:hover:not(:disabled)]:bg-ajna-warning bg-ajna-warning text-ajna-background",
  destructive:
    "[&:hover:not(:disabled)]:bg-ajna-destructive bg-ajna-destructive text-ajna-destructive-foreground",
  neutral:
    "[&:hover:not(:disabled)]:bg-ajna-foreground bg-ajna-foreground text-ajna-background",
};
const secondaryActions: Record<BannerVariant, string> = {
  info: "border-ajna-info/40 text-ajna-info [&:hover:not(:disabled)]:bg-ajna-info/10",
  success:
    "border-ajna-success/40 text-ajna-success [&:hover:not(:disabled)]:bg-ajna-success/10",
  warning:
    "border-ajna-warning/40 text-ajna-warning [&:hover:not(:disabled)]:bg-ajna-warning/10",
  destructive:
    "border-ajna-destructive-text/40 text-ajna-destructive-text [&:hover:not(:disabled)]:bg-ajna-destructive-text/10",
  neutral:
    "border-ajna-foreground/30 text-ajna-foreground [&:hover:not(:disabled)]:bg-ajna-foreground/10",
};
const ghostActions: Record<BannerVariant, string> = {
  info: "text-ajna-info [&:hover:not(:disabled)]:bg-ajna-info/10",
  success: "text-ajna-success [&:hover:not(:disabled)]:bg-ajna-success/10",
  warning: "text-ajna-warning [&:hover:not(:disabled)]:bg-ajna-warning/10",
  destructive:
    "text-ajna-destructive-text [&:hover:not(:disabled)]:bg-ajna-destructive-text/10",
  neutral:
    "text-ajna-foreground [&:hover:not(:disabled)]:bg-ajna-foreground/10",
};
const BannerAction = forwardRef<HTMLButtonElement, BannerActionProps>(
  function BannerAction(
    { className, variant = "primary", size, ...props },
    ref,
  ) {
    const context = useContext(ActionContext);
    const classes =
      variant === "primary"
        ? cn(
            "border border-solid border-transparent [&:hover:not(:disabled)]:bg-[linear-gradient(rgb(0_0_0_/_0.08),rgb(0_0_0_/_0.08))]",
            primaryActions[context.variant],
          )
        : variant === "secondary"
          ? cn(
              "border border-solid bg-transparent",
              secondaryActions[context.variant],
            )
          : ghostActions[context.variant];
    return (
      <Button
        {...props}
        ref={ref}
        variant="ghost"
        size={size ?? context.size}
        data-ajna-banner-action=""
        className={cn(classes, className)}
      />
    );
  },
);
BannerAction.displayName = "Banner.Action";

const BannerRoot = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    title,
    description,
    icon,
    action,
    variant = "info",
    size = "base",
    className,
    ...props
  },
  ref,
) {
  const id = useId();
  return (
    <ActionContext.Provider
      value={{
        variant,
        size: size === "sm" ? "xs" : "sm",
      }}
    >
      <div
        role={variant === "destructive" ? "alert" : "status"}
        aria-labelledby={title != null ? `${id}-title` : undefined}
        aria-describedby={description != null ? `${id}-description` : undefined}
        {...props}
        ref={ref}
        data-ajna-component="banner"
        data-slot="banner"
        data-variant={variant}
        data-size={size}
        className={cn(bannerVariants({ variant, size }), className)}
      >
        {icon != null && (
          <span
            aria-hidden="true"
            data-ajna-component="banner-icon"
            className="inline-flex h-5 shrink-0 items-center [&>svg]:h-4 [&>svg]:w-4"
          >
            {icon}
          </span>
        )}
        <div
          data-ajna-component="banner-body"
          className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3"
        >
          <div
            data-ajna-component="banner-content"
            className={cn(
              "min-w-0 flex-1",
              size === "sm"
                ? "flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5"
                : "flex flex-col gap-0.5",
            )}
          >
            {title != null && (
              <div
                id={`${id}-title`}
                data-ajna-component="banner-title"
                className="m-0 min-w-0 font-medium"
              >
                {title}
              </div>
            )}
            {description != null && (
              <div
                id={`${id}-description`}
                data-ajna-component="banner-description"
                className="m-0 min-w-0 [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-4 [&_p]:m-0"
              >
                {description}
              </div>
            )}
          </div>
          {action != null && (
            <div
              data-ajna-component="banner-actions"
              className="flex shrink-0 flex-wrap items-center gap-2"
            >
              {action}
            </div>
          )}
        </div>
      </div>
    </ActionContext.Provider>
  );
});
BannerRoot.displayName = "Banner";
export const Banner = Object.assign(BannerRoot, { Action: BannerAction });
