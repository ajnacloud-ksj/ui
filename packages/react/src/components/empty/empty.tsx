"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type EmptyProps = ComponentPropsWithoutRef<"div">;
export type EmptyHeaderProps = ComponentPropsWithoutRef<"div">;
export type EmptyMediaVariant = "default" | "icon";
export interface EmptyMediaProps extends ComponentPropsWithoutRef<"div"> {
  variant?: EmptyMediaVariant;
}
export type EmptyTitleProps = Omit<
  useRender.ComponentProps<"div", { slot: string }>,
  "ref"
>;
export type EmptyDescriptionProps = ComponentPropsWithoutRef<"div">;
export type EmptyContentProps = ComponentPropsWithoutRef<"div">;

const mediaVariants = {
  default: "bg-transparent",
  icon: "h-12 w-12 rounded-ajna-base bg-ajna-muted text-ajna-foreground [&>svg]:h-6 [&>svg]:w-6",
};
const mediaStyles = cva(
  "box-border flex shrink-0 items-center justify-center [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: { variant: mediaVariants },
    defaultVariants: { variant: "default" },
  },
);

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="empty"
      data-slot="empty"
      className={cn(
        "box-border flex w-full min-w-0 flex-col items-center justify-center gap-6 rounded-ajna-base p-6 text-center font-ajna text-ajna-foreground",
        className,
      )}
    />
  );
});
Empty.displayName = "Empty";

export const EmptyHeader = forwardRef<HTMLDivElement, EmptyHeaderProps>(
  function EmptyHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="empty-header"
        data-slot="empty-header"
        className={cn(
          "box-border flex max-w-sm flex-col items-center gap-2",
          className,
        )}
      />
    );
  },
);
EmptyHeader.displayName = "EmptyHeader";

export const EmptyMedia = forwardRef<HTMLDivElement, EmptyMediaProps>(
  function EmptyMedia({ variant = "default", className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="empty-media"
        data-slot="empty-media"
        data-variant={variant}
        className={cn(mediaStyles({ variant }), className)}
      />
    );
  },
);
EmptyMedia.displayName = "EmptyMedia";

export const EmptyTitle = forwardRef<HTMLElement, EmptyTitleProps>(
  function EmptyTitle({ className, render, ...props }, ref) {
    return useRender({
      defaultTagName: "div",
      ref,
      render,
      state: { slot: "empty-title" },
      props: {
        ...props,
        "data-ajna-component": "empty-title",
        className: cn(
          "m-0 box-border font-ajna text-lg font-semibold leading-7 tracking-tight text-ajna-foreground",
          className,
        ),
      },
    });
  },
);
EmptyTitle.displayName = "EmptyTitle";

export const EmptyDescription = forwardRef<
  HTMLDivElement,
  EmptyDescriptionProps
>(function EmptyDescription({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="empty-description"
      data-slot="empty-description"
      className={cn(
        "m-0 box-border text-sm leading-6 text-ajna-muted-foreground [&_a]:text-ajna-primary [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
    />
  );
});
EmptyDescription.displayName = "EmptyDescription";

export const EmptyContent = forwardRef<HTMLDivElement, EmptyContentProps>(
  function EmptyContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="empty-content"
        data-slot="empty-content"
        className={cn(
          "box-border flex w-full min-w-0 max-w-sm flex-col items-center gap-3 text-sm leading-5",
          className,
        )}
      />
    );
  },
);
EmptyContent.displayName = "EmptyContent";
