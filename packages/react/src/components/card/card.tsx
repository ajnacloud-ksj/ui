"use client";

import { useRender } from "@base-ui/react/use-render";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type CardSize = "base" | "sm";
export type CardProps = Omit<
  useRender.ComponentProps<"div", { slot: string; size: CardSize }>,
  "ref"
> & { size?: CardSize };
export type CardHeaderProps = ComponentPropsWithoutRef<"div">;
export type CardTitleProps = Omit<
  useRender.ComponentProps<"div", { slot: string }>,
  "ref"
>;
export type CardDescriptionProps = ComponentPropsWithoutRef<"div">;
export type CardActionProps = ComponentPropsWithoutRef<"div">;
export type CardContentProps = ComponentPropsWithoutRef<"div">;
export type CardFooterProps = ComponentPropsWithoutRef<"div">;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { size = "base", className, render, ...props },
  ref,
) {
  return useRender({
    defaultTagName: "div",
    ref,
    render,
    state: { slot: "card", size },
    props: {
      ...props,
      "data-ajna-component": "card",
      className: cn(
        "group/card box-border flex min-w-0 flex-col gap-[var(--ajna-card-spacing)] overflow-hidden rounded-ajna-lg border border-solid border-ajna-border bg-ajna-card py-[var(--ajna-card-spacing)] font-ajna text-sm leading-5 text-ajna-card-foreground shadow-sm [&:has(>[data-slot=card-footer]:last-child)]:pb-0 [&:has(>form:last-child>[data-slot=card-footer]:last-child)]:pb-0 [&:has(>img:first-child)]:pt-0",
        size === "sm"
          ? "[--ajna-card-spacing:0.75rem]"
          : "[--ajna-card-spacing:1rem]",
        className,
      ),
    },
  });
});
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="card-header"
        data-slot="card-header"
        className={cn(
          "box-border grid auto-rows-min grid-cols-1 items-start gap-x-[var(--ajna-card-spacing)] gap-y-1 border-0 border-solid border-ajna-border px-[var(--ajna-card-spacing)] [&.border-b]:pb-[var(--ajna-card-spacing)] [&:has(>[data-slot=card-action])]:grid-cols-[minmax(0,1fr)_auto] [&:has(>[data-slot=card-description])]:grid-rows-[auto_auto]",
          className,
        )}
      />
    );
  },
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLElement, CardTitleProps>(
  function CardTitle({ className, render, ...props }, ref) {
    return useRender({
      defaultTagName: "div",
      ref,
      render,
      state: { slot: "card-title" },
      props: {
        ...props,
        "data-ajna-component": "card-title",
        className: cn(
          "col-start-1 m-0 box-border min-w-0 font-ajna text-base font-medium leading-snug text-ajna-card-foreground group-data-[size=sm]/card:text-sm",
          className,
        ),
      },
    });
  },
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLDivElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="card-description"
        data-slot="card-description"
        className={cn(
          "col-start-1 m-0 box-border min-w-0 text-sm leading-5 text-ajna-muted-foreground",
          className,
        )}
      />
    );
  },
);
CardDescription.displayName = "CardDescription";

export const CardAction = forwardRef<HTMLDivElement, CardActionProps>(
  function CardAction({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="card-action"
        data-slot="card-action"
        className={cn(
          "col-start-2 row-span-2 row-start-1 box-border self-start justify-self-end",
          className,
        )}
      />
    );
  },
);
CardAction.displayName = "CardAction";

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="card-content"
        data-slot="card-content"
        className={cn(
          "box-border min-w-0 px-[var(--ajna-card-spacing)]",
          className,
        )}
      />
    );
  },
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="card-footer"
        data-slot="card-footer"
        className={cn(
          "box-border flex items-center gap-2 rounded-b-[inherit] border-0 border-t border-solid border-ajna-border bg-ajna-muted/50 p-[var(--ajna-card-spacing)]",
          className,
        )}
      />
    );
  },
);
CardFooter.displayName = "CardFooter";
