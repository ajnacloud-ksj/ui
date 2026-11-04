"use client";

import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { Button, type ButtonProps } from "@/components/button";
import { Input, type InputProps } from "@/components/input";
import { Textarea, type TextareaProps } from "@/components/textarea";
import { cn } from "@/utils";

export type InputGroupProps = ComponentPropsWithoutRef<"div">;
export type InputGroupAlign =
  "inline-start" | "inline-end" | "block-start" | "block-end";
export interface InputGroupAddonProps extends ComponentPropsWithoutRef<"div"> {
  /** Visual position; keep add-ons after the control in the DOM. @default "inline-start" */
  align?: InputGroupAlign;
}
export type InputGroupTextProps = ComponentPropsWithoutRef<"span">;
export type InputGroupInputProps = InputProps;
export type InputGroupTextareaProps = TextareaProps;
export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";
type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };
export type InputGroupButtonProps = Omit<ButtonProps, "size" | "shape"> &
  ({ size?: "xs" | "sm" } | ({ size: "icon-xs" | "icon-sm" } & AccessibleName));

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ className, ...props }, ref) {
    return (
      <div
        role="group"
        {...props}
        ref={ref}
        data-ajna-component="input-group"
        data-slot="input-group"
        className={cn(
          "relative box-border flex min-h-9 w-full min-w-0 items-center rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 font-ajna text-ajna-foreground shadow-sm transition-[border-color,box-shadow] has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col has-[[data-ajna-input-group-control]:focus-visible]:border-ajna-ring has-[[data-ajna-input-group-control][aria-invalid=true]]:border-ajna-destructive has-[[data-ajna-input-group-control]:disabled]:bg-ajna-muted has-[[data-ajna-input-group-control]:disabled]:opacity-50 has-[[data-ajna-input-group-control]:focus-visible]:ring-[3px] has-[[data-ajna-input-group-control][aria-invalid=true]]:ring-[3px] has-[[data-ajna-input-group-control]:focus-visible]:ring-ajna-ring/50 has-[[data-ajna-input-group-control][aria-invalid=true]]:ring-ajna-destructive/20 motion-reduce:transition-none",
          className,
        )}
      />
    );
  },
);
InputGroup.displayName = "InputGroup";

const alignments = {
  "inline-start": "order-first self-stretch ps-2",
  "inline-end": "order-last self-stretch pe-2",
  "block-start": "order-first w-full justify-start px-3 pt-2",
  "block-end": "order-last w-full justify-start px-3 pb-2",
};
const addonStyles = cva(
  "box-border flex cursor-text select-none items-center justify-center gap-2 text-sm font-medium leading-5 text-ajna-muted-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: { align: alignments },
    defaultVariants: { align: "inline-start" },
  },
);

export const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  function InputGroupAddon(
    { className, align = "inline-start", onClick, ...props },
    ref,
  ) {
    return (
      <div
        role="group"
        {...props}
        ref={ref}
        data-ajna-component="input-group-addon"
        data-slot="input-group-addon"
        data-align={align}
        className={cn(addonStyles({ align }), className)}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            (event.target as Element).closest(
              "button,a,input,textarea,select,[role=button],[contenteditable=true]",
            )
          )
            return;
          event.currentTarget
            .closest('[data-ajna-component="input-group"]')
            ?.querySelector<HTMLElement>('input:not([type="hidden"]),textarea')
            ?.focus();
        }}
      />
    );
  },
);
InputGroupAddon.displayName = "InputGroupAddon";

const buttonSizes = {
  xs: "h-6 gap-1 rounded-ajna-sm px-1.5 text-xs",
  sm: "h-8 gap-2 rounded-ajna-md px-2 text-sm",
  "icon-xs": "h-6 w-6 rounded-ajna-sm px-0",
  "icon-sm": "h-8 w-8 rounded-ajna-md px-0",
};
export const InputGroupButton = forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(function InputGroupButton(
  { className, size = "xs", variant = "ghost", ...props },
  ref,
) {
  return (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      size="base"
      shape="base"
      data-ajna-input-group-button=""
      data-size={size}
      className={cn("shadow-none", buttonSizes[size], className)}
    />
  );
});
InputGroupButton.displayName = "InputGroupButton";

export const InputGroupText = forwardRef<HTMLSpanElement, InputGroupTextProps>(
  function InputGroupText({ className, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        data-ajna-component="input-group-text"
        data-slot="input-group-text"
        className={cn(
          "box-border flex items-center gap-2 text-sm leading-5 text-ajna-muted-foreground [&>svg]:pointer-events-none [&>svg]:h-4 [&>svg]:w-4",
          className,
        )}
      />
    );
  },
);
InputGroupText.displayName = "InputGroupText";

const controlClasses =
  "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-[invalid=true]:ring-0 disabled:bg-transparent disabled:opacity-100";
export const InputGroupInput = forwardRef<HTMLElement, InputGroupInputProps>(
  function InputGroupInput({ className, ...props }, ref) {
    const classes = cn(controlClasses, "h-[2.125rem]");
    return (
      <Input
        {...props}
        ref={ref}
        data-ajna-input-group-control=""
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
InputGroupInput.displayName = "InputGroupInput";

export const InputGroupTextarea = forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(function InputGroupTextarea({ className, ...props }, ref) {
  return (
    <Textarea
      {...props}
      ref={ref}
      data-ajna-input-group-control=""
      className={cn(controlClasses, "resize-none", className)}
    />
  );
});
InputGroupTextarea.displayName = "InputGroupTextarea";
