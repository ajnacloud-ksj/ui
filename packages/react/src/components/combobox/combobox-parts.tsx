"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useDirection } from "@base-ui/react/direction-provider";
import { Check, ChevronDown, X } from "lucide-react";
import { forwardRef, useRef } from "react";

import { InputGroup } from "@/components/input-group";
import { cn } from "@/utils";

export type ComboboxValue = string | number;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxCollection = BaseCombobox.Collection;
export type ComboboxRootProps<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
> = BaseCombobox.Root.Props<Value, Multiple, Item>;
export function ComboboxRoot<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>({ modal = true, ...props }: ComboboxRootProps<Value, Multiple, Item>) {
  return <BaseCombobox.Root<Value, Multiple, Item> modal={modal} {...props} />;
}
export type ComboboxValueProps = BaseCombobox.Value.Props;
export type ComboboxCollectionProps = BaseCombobox.Collection.Props;

export type ComboboxInputGroupProps = BaseCombobox.InputGroup.Props;
export const ComboboxInputGroup = forwardRef<
  HTMLDivElement,
  ComboboxInputGroupProps
>(function ComboboxInputGroup({ className, render, ...props }, ref) {
  const direction = useDirection();
  const classes =
    "relative box-border flex min-h-9 w-full min-w-0 items-center gap-1 rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 pe-1 font-ajna text-sm leading-5 text-ajna-foreground shadow-sm transition-[border-color,box-shadow] has-[input:focus-visible]:border-ajna-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ajna-ring/50 has-[[aria-invalid=true]]:border-ajna-destructive has-[[aria-invalid=true]]:ring-[3px] has-[[aria-invalid=true]]:ring-ajna-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:bg-ajna-muted data-[disabled]:opacity-50 motion-reduce:transition-none";
  return (
    <BaseCombobox.InputGroup
      dir={direction}
      {...props}
      render={render ?? <InputGroup />}
      ref={ref}
      data-ajna-component="combobox-inputgroup"
      data-slot="combobox-inputgroup"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ComboboxInputGroup.displayName = "Combobox.InputGroup";

export type ComboboxChipsInputProps = BaseCombobox.Input.Props;
export const ComboboxChipsInput = forwardRef<
  HTMLInputElement,
  ComboboxChipsInputProps
>(function ComboboxChipsInput({ className, ...props }, ref) {
  const classes =
    "m-0 box-border h-[2.125rem] min-w-8 flex-1 rounded-none border-0 border-solid bg-transparent px-3 py-1 font-ajna text-base leading-5 text-ajna-foreground outline-none placeholder:text-ajna-muted-foreground disabled:cursor-not-allowed md:text-sm";
  return (
    <BaseCombobox.Input
      {...props}
      data-ajna-input-group-control=""
      ref={ref}
      data-ajna-component="combobox-chipsinput"
      data-slot="combobox-chipsinput"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ComboboxChipsInput.displayName = "Combobox.ChipsInput";

export type ComboboxListProps = BaseCombobox.List.Props;
export const ComboboxList = forwardRef<HTMLDivElement, ComboboxListProps>(
  function ComboboxList({ className, ...props }, ref) {
    const classes =
      "box-border min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 outline-none data-[empty]:p-0";
    return (
      <BaseCombobox.List
        {...props}
        ref={ref}
        data-ajna-component="combobox-list"
        data-slot="combobox-list"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ComboboxList.displayName = "Combobox.List";

export type ComboboxEmptyProps = BaseCombobox.Empty.Props;
export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  function ComboboxEmpty({ className, ...props }, ref) {
    const classes =
      "box-border px-3 py-5 text-center text-sm text-ajna-muted-foreground empty:p-0";
    return (
      <BaseCombobox.Empty
        {...props}
        ref={ref}
        data-ajna-component="combobox-empty"
        data-slot="combobox-empty"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ComboboxEmpty.displayName = "Combobox.Empty";

export type ComboboxStatusProps = BaseCombobox.Status.Props;
export const ComboboxStatus = forwardRef<HTMLDivElement, ComboboxStatusProps>(
  function ComboboxStatus({ className, ...props }, ref) {
    const classes =
      "box-border px-3 py-2 text-sm text-ajna-muted-foreground empty:p-0";
    return (
      <BaseCombobox.Status
        {...props}
        ref={ref}
        data-ajna-component="combobox-status"
        data-slot="combobox-status"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ComboboxStatus.displayName = "Combobox.Status";

export type ComboboxGroupProps = BaseCombobox.Group.Props;
export const ComboboxGroup = forwardRef<HTMLDivElement, ComboboxGroupProps>(
  function ComboboxGroup({ className, ...props }, ref) {
    const classes = "box-border";
    return (
      <BaseCombobox.Group
        {...props}
        ref={ref}
        data-ajna-component="combobox-group"
        data-slot="combobox-group"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ComboboxGroup.displayName = "Combobox.Group";

export type ComboboxGroupLabelProps = BaseCombobox.GroupLabel.Props;
export const ComboboxGroupLabel = forwardRef<
  HTMLDivElement,
  ComboboxGroupLabelProps
>(function ComboboxGroupLabel({ className, ...props }, ref) {
  const classes =
    "box-border px-2 py-1.5 text-xs font-medium text-ajna-muted-foreground";
  return (
    <BaseCombobox.GroupLabel
      {...props}
      ref={ref}
      data-ajna-component="combobox-grouplabel"
      data-slot="combobox-grouplabel"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ComboboxGroupLabel.displayName = "Combobox.GroupLabel";

export type ComboboxSeparatorProps = BaseCombobox.Separator.Props;
export const ComboboxSeparator = forwardRef<
  HTMLDivElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator({ className, ...props }, ref) {
  const classes = "my-1 box-border h-px shrink-0 bg-ajna-border";
  return (
    <BaseCombobox.Separator
      {...props}
      ref={ref}
      data-ajna-component="combobox-separator"
      data-slot="combobox-separator"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ComboboxSeparator.displayName = "Combobox.Separator";

export type ComboboxChipsProps = BaseCombobox.Chips.Props;
export const ComboboxChips = forwardRef<HTMLDivElement, ComboboxChipsProps>(
  function ComboboxChips({ className, ...props }, ref) {
    const classes =
      "box-border flex min-w-0 flex-1 flex-wrap items-center gap-1 p-1";
    return (
      <BaseCombobox.Chips
        {...props}
        ref={ref}
        data-ajna-component="combobox-chips"
        data-slot="combobox-chips"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ComboboxChips.displayName = "Combobox.Chips";

export interface ComboboxChipProps extends BaseCombobox.Chip.Props {
  showRemove?: boolean;
  removeLabel?: string;
}
export const ComboboxChip = forwardRef<HTMLDivElement, ComboboxChipProps>(
  function ComboboxChip(
    {
      className,
      children,
      showRemove = true,
      removeLabel = typeof children === "string"
        ? `Remove ${children}`
        : "Remove selection",
      ...props
    },
    ref,
  ) {
    const classes =
      "box-border inline-flex max-w-full items-center gap-1 rounded-ajna-sm border border-solid border-ajna-border bg-ajna-muted px-1.5 py-0.5 font-ajna text-xs leading-5 text-ajna-foreground outline-none focus-visible:ring-2 focus-visible:ring-ajna-ring";
    return (
      <BaseCombobox.Chip
        {...props}
        ref={ref}
        data-ajna-component="combobox-chip"
        data-slot="combobox-chip"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children}
        {showRemove && <ComboboxChipRemove aria-label={removeLabel} />}
      </BaseCombobox.Chip>
    );
  },
);
ComboboxChip.displayName = "Combobox.Chip";

export type ComboboxTriggerProps = BaseCombobox.Trigger.Props;
export const ComboboxTrigger = forwardRef<
  HTMLButtonElement,
  ComboboxTriggerProps
>(function ComboboxTrigger(
  { className, children, "aria-label": label = "Open options", ...props },
  ref,
) {
  const classes =
    "m-0 box-border inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 border-solid bg-transparent p-0 text-ajna-muted-foreground outline-none hover:bg-ajna-accent focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50";
  return (
    <BaseCombobox.Trigger
      {...props}
      ref={ref}
      aria-label={label}
      data-ajna-component="combobox-trigger"
      data-slot="combobox-trigger"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children}
      <ChevronDown aria-hidden="true" size={14} />
    </BaseCombobox.Trigger>
  );
});
ComboboxTrigger.displayName = "Combobox.Trigger";

export type ComboboxClearProps = BaseCombobox.Clear.Props;
export const ComboboxClear = forwardRef<HTMLButtonElement, ComboboxClearProps>(
  function ComboboxClear(
    { className, children, "aria-label": label = "Clear selection", ...props },
    ref,
  ) {
    const classes =
      "m-0 box-border inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 border-solid bg-transparent p-0 text-ajna-muted-foreground outline-none hover:bg-ajna-accent focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50";
    return (
      <BaseCombobox.Clear
        {...props}
        ref={ref}
        aria-label={label}
        data-ajna-component="combobox-clear"
        data-slot="combobox-clear"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children ?? <X aria-hidden="true" size={14} />}
      </BaseCombobox.Clear>
    );
  },
);
ComboboxClear.displayName = "Combobox.Clear";

export type ComboboxChipRemoveProps = BaseCombobox.ChipRemove.Props;
export const ComboboxChipRemove = forwardRef<
  HTMLButtonElement,
  ComboboxChipRemoveProps
>(function ComboboxChipRemove(
  { className, children, "aria-label": label = "Remove selection", ...props },
  ref,
) {
  const classes =
    "m-0 box-border inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 border-solid bg-transparent p-0 text-ajna-muted-foreground outline-none hover:text-ajna-foreground focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50";
  return (
    <BaseCombobox.ChipRemove
      {...props}
      ref={ref}
      aria-label={label}
      data-ajna-component="combobox-chipremove"
      data-slot="combobox-chipremove"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children ?? <X aria-hidden="true" size={14} />}
    </BaseCombobox.ChipRemove>
  );
});
ComboboxChipRemove.displayName = "Combobox.ChipRemove";

export type ComboboxItemIndicatorProps = BaseCombobox.ItemIndicator.Props;
export const ComboboxItemIndicator = forwardRef<
  HTMLSpanElement,
  ComboboxItemIndicatorProps
>(function ComboboxItemIndicator({ className, children, ...props }, ref) {
  const classes =
    "absolute end-2 inline-flex h-4 w-4 items-center justify-center";
  return (
    <BaseCombobox.ItemIndicator
      {...props}
      ref={ref}
      data-ajna-component="combobox-indicator"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children ?? <Check size={14} aria-hidden="true" />}
    </BaseCombobox.ItemIndicator>
  );
});
ComboboxItemIndicator.displayName = "Combobox.ItemIndicator";

export interface ComboboxItemProps extends BaseCombobox.Item.Props {
  /** Render the default check indicator. @default true */
  showIndicator?: boolean;
}
export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(
    { className, children, showIndicator = true, ...props },
    ref,
  ) {
    const classes =
      "relative box-border flex min-h-8 w-full cursor-default select-none items-center gap-2 rounded-ajna-sm border-0 border-solid bg-transparent py-1.5 pe-8 ps-2 font-ajna text-sm leading-5 text-ajna-popover-foreground outline-none data-[highlighted]:bg-ajna-accent data-[highlighted]:text-ajna-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0";
    return (
      <BaseCombobox.Item
        {...props}
        ref={ref}
        data-ajna-component="combobox-item"
        data-slot="combobox-item"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children}
        {showIndicator && <ComboboxItemIndicator />}
      </BaseCombobox.Item>
    );
  },
);
ComboboxItem.displayName = "Combobox.Item";

export interface ComboboxInputProps extends ComboboxChipsInputProps {
  showTrigger?: boolean;
  showClear?: boolean;
}
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function ComboboxInput(
    {
      showTrigger = true,
      showClear = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <ComboboxInputGroup>
        <ComboboxChipsInput
          {...props}
          disabled={disabled}
          ref={ref}
          className={className}
        />
        {showClear && <ComboboxClear disabled={disabled} />}
        {showTrigger && <ComboboxTrigger disabled={disabled} />}
        {children}
      </ComboboxInputGroup>
    );
  },
);
ComboboxInput.displayName = "Combobox.Input";

export interface ComboboxContentProps
  extends
    BaseCombobox.Popup.Props,
    Pick<
      BaseCombobox.Positioner.Props,
      | "side"
      | "align"
      | "sideOffset"
      | "alignOffset"
      | "anchor"
      | "collisionBoundary"
      | "collisionPadding"
    > {
  container?: BaseCombobox.Portal.Props["container"];
  keepMounted?: boolean;
}
export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  function ComboboxContent(
    {
      container,
      keepMounted,
      anchor,
      side = "bottom",
      align = "start",
      sideOffset = 4,
      alignOffset = 0,
      collisionBoundary,
      collisionPadding = 8,
      className,
      ...props
    },
    ref,
  ) {
    const direction = useDirection();
    const classes =
      "relative box-border flex max-h-[min(24rem,var(--available-height))] w-[var(--anchor-width)] min-w-[min(12rem,var(--available-width))] max-w-[var(--available-width)] origin-[var(--transform-origin)] flex-col overflow-hidden rounded-ajna-base border border-solid border-ajna-border bg-ajna-popover font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-md outline-none transition-[opacity,transform] duration-150 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-reduce:transition-none";
    return (
      <BaseCombobox.Portal
        container={container}
        keepMounted={keepMounted}
        data-ajna-component="combobox-portal"
        className="relative z-[1100]"
      >
        <BaseCombobox.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          data-ajna-component="combobox-positioner"
          className="isolate z-[1100]"
        >
          <BaseCombobox.Popup
            dir={direction}
            {...props}
            ref={ref}
            data-ajna-component="combobox-content"
            data-slot="combobox-content"
            className={
              typeof className === "function"
                ? (state) => cn(classes, className(state))
                : cn(classes, className)
            }
          />
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    );
  },
);
ComboboxContent.displayName = "Combobox.Content";

export const ComboboxLabel = ComboboxGroupLabel;
export type ComboboxLabelProps = ComboboxGroupLabelProps;
export function useComboboxAnchor() {
  return useRef<HTMLDivElement>(null);
}
