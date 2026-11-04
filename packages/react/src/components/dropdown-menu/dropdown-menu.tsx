"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva } from "class-variance-authority";
import { Check, ChevronRight } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type DropdownMenuRootProps<Payload = unknown> =
  BaseMenu.Root.Props<Payload>;
export type DropdownMenuTriggerProps<Payload = unknown> = Omit<
  BaseMenu.Trigger.Props<Payload>,
  "ref"
>;
export type DropdownMenuGroupProps = ComponentPropsWithoutRef<
  typeof BaseMenu.Group
>;
export type DropdownMenuSubProps = BaseMenu.SubmenuRoot.Props;
export type DropdownMenuRadioGroupProps = ComponentPropsWithoutRef<
  typeof BaseMenu.RadioGroup
>;
export type DropdownMenuShortcutProps = ComponentPropsWithoutRef<"span">;
export interface DropdownMenuContentProps
  extends
    ComponentPropsWithoutRef<typeof BaseMenu.Popup>,
    Pick<
      BaseMenu.Positioner.Props,
      | "side"
      | "align"
      | "sideOffset"
      | "alignOffset"
      | "collisionPadding"
      | "collisionBoundary"
    > {
  /** Portal destination. Defaults to document.body. */
  container?: BaseMenu.Portal.Props["container"];
  keepMounted?: boolean;
}
export type DropdownMenuSubContentProps = DropdownMenuContentProps;
export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<
  typeof BaseMenu.Item
> {
  variant?: "default" | "destructive";
  inset?: boolean;
}
export interface DropdownMenuLinkItemProps extends ComponentPropsWithoutRef<
  typeof BaseMenu.LinkItem
> {
  variant?: "default" | "destructive";
  inset?: boolean;
}
export interface DropdownMenuLabelProps extends ComponentPropsWithoutRef<
  typeof BaseMenu.GroupLabel
> {
  inset?: boolean;
}
export interface DropdownMenuSubTriggerProps extends ComponentPropsWithoutRef<
  typeof BaseMenu.SubmenuTrigger
> {
  inset?: boolean;
}
export type DropdownMenuCheckboxItemProps = ComponentPropsWithoutRef<
  typeof BaseMenu.CheckboxItem
>;
export type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<
  typeof BaseMenu.RadioItem
>;
export type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<
  typeof BaseMenu.Separator
>;

const contentClasses =
  "box-border min-w-[12rem] max-w-[var(--available-width)] max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded-ajna-lg border border-solid border-ajna-border bg-ajna-popover p-1 font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-md outline-none transition-[opacity,transform] duration-150 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none motion-reduce:transition-none";
const rowVariants = {
  default:
    "text-ajna-popover-foreground data-[highlighted]:bg-ajna-accent data-[highlighted]:text-ajna-accent-foreground data-[popup-open]:bg-ajna-accent",
  destructive:
    "text-ajna-destructive-text data-[highlighted]:bg-ajna-destructive-tint data-[highlighted]:text-ajna-destructive-text",
};
const rowStyles = cva(
  "relative box-border flex min-w-0 cursor-default select-none items-center gap-2 rounded-ajna-sm border-0 bg-transparent px-2 py-1.5 font-ajna text-sm leading-5 no-underline outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: { variant: rowVariants, inset: { true: "ps-8", false: null } },
    defaultVariants: { variant: "default", inset: false },
  },
);

const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(function DropdownMenuContent(
  {
    side = "bottom",
    align = "start",
    sideOffset = 4,
    alignOffset = 0,
    collisionPadding = 8,
    collisionBoundary,
    container,
    keepMounted,
    className,
    ...props
  },
  ref,
) {
  return (
    <BaseMenu.Portal container={container} keepMounted={keepMounted}>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
        data-ajna-component="dropdown-menu-positioner"
        className="isolate z-[1100] outline-none"
      >
        <BaseMenu.Popup
          {...props}
          ref={ref}
          data-ajna-component="dropdown-menu-content"
          data-slot="dropdown-menu-content"
          className={
            typeof className === "function"
              ? (state) => cn(contentClasses, className(state))
              : cn(contentClasses, className)
          }
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenu.Content";

const DropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(function DropdownMenuSubContent(
  {
    side = "inline-end",
    align = "start",
    sideOffset = 4,
    alignOffset = -4,
    ...props
  },
  ref,
) {
  return (
    <DropdownMenuContent
      {...props}
      ref={ref}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    />
  );
});
DropdownMenuSubContent.displayName = "DropdownMenu.SubContent";

const DropdownMenuItem = forwardRef<HTMLElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { className, variant = "default", inset = false, ...props },
    ref,
  ) {
    const classes = rowStyles({ variant, inset });
    return (
      <BaseMenu.Item
        {...props}
        ref={ref}
        data-ajna-component="dropdown-menu-item"
        data-variant={variant}
        data-inset={inset || undefined}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenu.Item";

const DropdownMenuLinkItem = forwardRef<Element, DropdownMenuLinkItemProps>(
  function DropdownMenuLinkItem(
    {
      className,
      variant = "default",
      inset = false,
      closeOnClick = true,
      ...props
    },
    ref,
  ) {
    const classes = rowStyles({ variant, inset });
    return (
      <BaseMenu.LinkItem
        {...props}
        ref={ref}
        closeOnClick={closeOnClick}
        data-ajna-component="dropdown-menu-link-item"
        data-variant={variant}
        data-inset={inset || undefined}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DropdownMenuLinkItem.displayName = "DropdownMenu.LinkItem";

const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, inset = false, ...props }, ref) {
    const classes = cn(
      "box-border px-2 py-1.5 font-ajna text-xs font-medium leading-5 text-ajna-muted-foreground",
      inset && "ps-8",
    );
    return (
      <BaseMenu.GroupLabel
        {...props}
        ref={ref}
        data-ajna-component="dropdown-menu-label"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DropdownMenuLabel.displayName = "DropdownMenu.Label";

const DropdownMenuSubTrigger = forwardRef<
  HTMLElement,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger(
  { className, inset = false, children, ...props },
  ref,
) {
  const classes = rowStyles({ inset });
  return (
    <BaseMenu.SubmenuTrigger
      {...props}
      ref={ref}
      data-ajna-component="dropdown-menu-sub-trigger"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children}
      <ChevronRight
        aria-hidden="true"
        focusable="false"
        data-ajna-component="dropdown-menu-chevron"
        className="ms-auto rtl:rotate-180"
      />
    </BaseMenu.SubmenuTrigger>
  );
});
DropdownMenuSubTrigger.displayName = "DropdownMenu.SubTrigger";

const DropdownMenuCheckboxItem = forwardRef<
  HTMLElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  const classes = rowStyles({ inset: true });
  return (
    <BaseMenu.CheckboxItem
      {...props}
      ref={ref}
      data-ajna-component="dropdown-menu-checkbox-item"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      <BaseMenu.CheckboxItemIndicator
        data-ajna-component="dropdown-menu-checkbox-indicator"
        className="absolute start-2 flex h-4 w-4 items-center justify-center"
      >
        <Check aria-hidden="true" focusable="false" />
      </BaseMenu.CheckboxItemIndicator>
      {children}
    </BaseMenu.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = "DropdownMenu.CheckboxItem";

const DropdownMenuRadioItem = forwardRef<
  HTMLElement,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  const classes = rowStyles({ inset: true });
  return (
    <BaseMenu.RadioItem
      {...props}
      ref={ref}
      data-ajna-component="dropdown-menu-radio-item"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      <BaseMenu.RadioItemIndicator
        data-ajna-component="dropdown-menu-radio-indicator"
        className="absolute start-2 flex h-4 w-4 items-center justify-center"
      >
        <Check aria-hidden="true" focusable="false" />
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = "DropdownMenu.RadioItem";

const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  const classes = "-mx-1 my-1 h-px border-0 bg-ajna-border";
  return (
    <BaseMenu.Separator
      {...props}
      ref={ref}
      data-ajna-component="dropdown-menu-separator"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
DropdownMenuSeparator.displayName = "DropdownMenu.Separator";

const DropdownMenuShortcut = forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(function DropdownMenuShortcut({ className, ...props }, ref) {
  return (
    <span
      aria-hidden="true"
      {...props}
      ref={ref}
      data-ajna-component="dropdown-menu-shortcut"
      className={cn(
        "ms-auto ps-4 font-ajna text-xs tracking-widest text-ajna-muted-foreground",
        className,
      )}
    />
  );
});
DropdownMenuShortcut.displayName = "DropdownMenu.Shortcut";

export const DropdownMenu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Content: DropdownMenuContent,
  Group: BaseMenu.Group,
  Label: DropdownMenuLabel,
  Item: DropdownMenuItem,
  LinkItem: DropdownMenuLinkItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: BaseMenu.RadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: BaseMenu.SubmenuRoot,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};
