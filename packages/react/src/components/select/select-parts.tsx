"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/utils";

export const SelectRoot = BaseSelect.Root;
export type SelectRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;
export type SelectValue = string | number;
export type SelectSize = "sm" | "base";
export type SelectValueProps = BaseSelect.Value.Props;
export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  function SelectValue({ className, ...props }, ref) {
    const classes =
      "flex min-w-0 flex-1 items-center gap-2 truncate text-start data-[placeholder]:text-ajna-muted-foreground";
    return (
      <BaseSelect.Value
        {...props}
        ref={ref}
        data-ajna-component="select-value"
        data-slot="select-value"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);

export interface SelectTriggerProps extends BaseSelect.Trigger.Props {
  size?: SelectSize;
}
const sizes = { sm: "h-8 px-2.5 text-xs", base: "h-9 px-3 text-sm" };
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    { className, children, size = "base", ...props },
    ref,
  ) {
    const direction = useDirection();
    const classes = cn(
      "m-0 box-border inline-flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 py-1 font-ajna leading-5 text-ajna-foreground shadow-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default data-[invalid]:border-ajna-destructive data-[disabled]:bg-ajna-muted data-[disabled]:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
      sizes[size],
    );
    return (
      <BaseSelect.Trigger
        dir={direction}
        {...props}
        ref={ref}
        data-ajna-component="select-trigger"
        data-slot="select-trigger"
        data-size={size}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children}
        <BaseSelect.Icon
          aria-hidden="true"
          data-ajna-component="select-icon"
          className="inline-flex shrink-0 text-ajna-muted-foreground"
        >
          <ChevronDown size={14} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    );
  },
);

export type SelectGroupProps = BaseSelect.Group.Props;
export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  function SelectGroup({ className, ...props }, ref) {
    const classes = "box-border";
    return (
      <BaseSelect.Group
        {...props}
        ref={ref}
        data-ajna-component="select-group"
        data-slot="select-group"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
export type SelectLabelProps = BaseSelect.GroupLabel.Props;
export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ className, ...props }, ref) {
    const classes =
      "box-border px-2 py-1.5 text-xs font-medium text-ajna-muted-foreground";
    return (
      <BaseSelect.GroupLabel
        {...props}
        ref={ref}
        data-ajna-component="select-label"
        data-slot="select-label"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
export const SelectGroupLabel = SelectLabel;
export type SelectGroupLabelProps = SelectLabelProps;

export type SelectItemProps = BaseSelect.Item.Props;
export const SelectItem = forwardRef<HTMLElement, SelectItemProps>(
  function SelectItem({ children, className, ...props }, ref) {
    const classes =
      "relative box-border flex min-h-8 w-full cursor-default select-none items-center gap-2 rounded-ajna-sm border-0 border-solid bg-transparent py-1.5 pe-8 ps-2 font-ajna text-sm leading-5 text-ajna-popover-foreground outline-none data-[highlighted]:bg-ajna-accent data-[highlighted]:text-ajna-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";
    return (
      <BaseSelect.Item
        {...props}
        ref={ref}
        data-ajna-component="select-item"
        data-slot="select-item"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        <BaseSelect.ItemText
          data-ajna-component="select-item-text"
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          {children}
        </BaseSelect.ItemText>
        <BaseSelect.ItemIndicator
          data-ajna-component="select-item-indicator"
          className="absolute end-2 inline-flex h-4 w-4 items-center justify-center"
        >
          <Check size={14} aria-hidden="true" />
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    );
  },
);

export type SelectSeparatorProps = BaseSelect.Separator.Props;
export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...props }, ref) {
    const classes =
      "pointer-events-none my-1 box-border h-px shrink-0 bg-ajna-border";
    return (
      <BaseSelect.Separator
        {...props}
        ref={ref}
        data-ajna-component="select-separator"
        data-slot="select-separator"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);

export type SelectScrollUpButtonProps = BaseSelect.ScrollUpArrow.Props;
export const SelectScrollUpButton = forwardRef<
  HTMLDivElement,
  SelectScrollUpButtonProps
>(function SelectScrollUpButton({ className, children, ...props }, ref) {
  const classes =
    "absolute inset-x-0 top-0 z-10 flex h-6 cursor-default items-center justify-center bg-ajna-popover text-ajna-muted-foreground";
  return (
    <BaseSelect.ScrollUpArrow
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="select-scroll-up-button"
      data-slot="select-scroll-up-button"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children ?? <ChevronUp size={14} />}
    </BaseSelect.ScrollUpArrow>
  );
});
export type SelectScrollDownButtonProps = BaseSelect.ScrollDownArrow.Props;
export const SelectScrollDownButton = forwardRef<
  HTMLDivElement,
  SelectScrollDownButtonProps
>(function SelectScrollDownButton({ className, children, ...props }, ref) {
  const classes =
    "absolute inset-x-0 bottom-0 z-10 flex h-6 cursor-default items-center justify-center bg-ajna-popover text-ajna-muted-foreground";
  return (
    <BaseSelect.ScrollDownArrow
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="select-scroll-down-button"
      data-slot="select-scroll-down-button"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children ?? <ChevronDown size={14} />}
    </BaseSelect.ScrollDownArrow>
  );
});

export interface SelectContentProps
  extends
    BaseSelect.Popup.Props,
    Pick<
      BaseSelect.Positioner.Props,
      | "side"
      | "align"
      | "sideOffset"
      | "alignOffset"
      | "alignItemWithTrigger"
      | "anchor"
      | "collisionBoundary"
      | "collisionPadding"
    > {
  container?: BaseSelect.Portal.Props["container"];
  listClassName?: string;
}
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    {
      container,
      side = "bottom",
      align = "center",
      sideOffset = 4,
      alignOffset = 0,
      alignItemWithTrigger = true,
      anchor,
      collisionBoundary,
      collisionPadding = 8,
      className,
      listClassName,
      children,
      ...props
    },
    ref,
  ) {
    const direction = useDirection();
    const classes =
      "relative box-border flex max-h-[min(24rem,var(--available-height))] w-[var(--anchor-width)] min-w-[min(8rem,var(--available-width))] max-w-[var(--available-width)] origin-[var(--transform-origin)] flex-col overflow-hidden rounded-ajna-base border border-solid border-ajna-border bg-ajna-popover font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-md outline-none transition-[opacity,transform] duration-150 ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[align-trigger=true]:transition-none motion-reduce:transition-none";
    return (
      <BaseSelect.Portal
        container={container}
        data-ajna-component="select-portal"
        className="relative z-[1100]"
      >
        <BaseSelect.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          alignItemWithTrigger={alignItemWithTrigger}
          anchor={anchor}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          data-ajna-component="select-positioner"
          className="isolate z-[1100]"
        >
          <BaseSelect.Popup
            dir={direction}
            {...props}
            ref={ref}
            data-ajna-component="select-content"
            data-slot="select-content"
            data-align-trigger={alignItemWithTrigger}
            className={
              typeof className === "function"
                ? (state) => cn(classes, className(state))
                : cn(classes, className)
            }
          >
            <SelectScrollUpButton />
            <BaseSelect.List
              data-ajna-component="select-list"
              data-slot="select-list"
              className={cn(
                "box-border min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 outline-none",
                listClassName,
              )}
            >
              {children}
            </BaseSelect.List>
            <SelectScrollDownButton />
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    );
  },
);
