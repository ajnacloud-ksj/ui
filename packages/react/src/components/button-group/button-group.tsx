"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { Separator, type SeparatorProps } from "@/components/separator";
import { cn } from "@/utils";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export interface ButtonGroupVariantProps {
  /** Arrangement of the controls. @default "horizontal" */
  orientation?: ButtonGroupOrientation;
}
export interface ButtonGroupProps
  extends ComponentPropsWithoutRef<"div">, ButtonGroupVariantProps {}
export type ButtonGroupTextProps = Omit<
  useRender.ComponentProps<"div", { slot: string }>,
  "ref"
>;
export type ButtonGroupSeparatorProps = SeparatorProps;

// Focus guards and portal owners do not count as visible group items.
const orientations = {
  horizontal:
    "[&>*:not(:nth-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:rounded-s-none [&>*:not(:nth-last-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:rounded-e-none [&>*:not(:nth-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:border-s-0",
  vertical:
    "flex-col [&>*:not(:nth-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:rounded-t-none [&>*:not(:nth-last-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:rounded-b-none [&>*:not(:nth-child(1_of_:not([data-base-ui-focus-guard],span[aria-owns])))]:border-t-0",
};
const groupStyles = cva(
  "box-border inline-flex w-fit items-stretch font-ajna has-[>[data-ajna-component=button-group]]:gap-2 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>input]:min-w-0 [&>input]:flex-1",
  {
    variants: { orientation: orientations },
    defaultVariants: { orientation: "horizontal" },
  },
);

export function buttonGroupVariants({
  orientation,
}: ButtonGroupVariantProps = {}) {
  return cn(
    groupStyles({
      orientation,
    }),
  );
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    { className, orientation = "horizontal", ...props },
    ref,
  ) {
    return (
      <div
        role="group"
        {...props}
        ref={ref}
        data-ajna-component="button-group"
        data-slot="button-group"
        data-orientation={orientation}
        className={cn(buttonGroupVariants({ orientation }), className)}
      />
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";

export const ButtonGroupText = forwardRef<HTMLElement, ButtonGroupTextProps>(
  function ButtonGroupText({ className, render, ...props }, ref) {
    return useRender({
      defaultTagName: "div",
      ref,
      render,
      state: { slot: "button-group-text" },
      props: {
        ...props,
        "data-ajna-component": "button-group-text",
        className: cn(
          "box-border flex min-h-9 items-center gap-2 rounded-ajna-base border border-solid border-ajna-border bg-ajna-muted px-3 font-ajna text-sm font-medium leading-5 text-ajna-muted-foreground [&>svg]:pointer-events-none [&>svg]:h-4 [&>svg]:w-4",
          className,
        ),
      },
    });
  },
);
ButtonGroupText.displayName = "ButtonGroupText";

export const ButtonGroupSeparator = forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(function ButtonGroupSeparator(
  { className, orientation = "vertical", ...props },
  ref,
) {
  const classes = cn(
    "relative self-stretch bg-ajna-input",
    orientation === "horizontal" ? "mx-px w-auto" : "my-px h-auto",
  );
  return (
    <Separator
      role="presentation"
      aria-hidden="true"
      {...props}
      ref={ref}
      orientation={orientation}
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";
