"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { forwardRef } from "react";

import {
  DropdownMenu,
  type DropdownMenuContentProps,
} from "@/components/dropdown-menu";
import { cn } from "@/utils";

export type MenubarProps = BaseMenubar.Props;
export type MenubarMenuProps<Payload = unknown> = BaseMenu.Root.Props<Payload>;
export type MenubarTriggerProps = BaseMenu.Trigger.Props;
export type MenubarContentProps = DropdownMenuContentProps;
export type MenubarPortalProps = BaseMenu.Portal.Props;

export const MenubarRoot = forwardRef<HTMLDivElement, MenubarProps>(
  function MenubarRoot({ className, ...props }, ref) {
    const classes =
      "box-border flex w-fit items-center gap-1 rounded-ajna-base border border-solid border-ajna-border bg-ajna-background p-1 font-ajna text-sm text-ajna-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch";
    return (
      <BaseMenubar
        {...props}
        ref={ref}
        data-ajna-component="menubar"
        data-slot="menubar"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
export function MenubarMenu<Payload = unknown>(
  props: MenubarMenuProps<Payload>,
) {
  return <BaseMenu.Root {...props} />;
}
export const MenubarPortal = BaseMenu.Portal;
export const MenubarTrigger = forwardRef<
  HTMLButtonElement,
  MenubarTriggerProps
>(function MenubarTrigger({ className, ...props }, ref) {
  const classes =
    "inline-flex cursor-default select-none items-center justify-center rounded-ajna-sm border-0 bg-transparent px-3 py-1.5 font-ajna text-sm font-medium leading-5 text-ajna-foreground outline-none hover:bg-ajna-accent data-[popup-open]:bg-ajna-accent data-[highlighted]:bg-ajna-accent focus-visible:ring-2 focus-visible:ring-ajna-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ajna-background data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
  return (
    <BaseMenu.Trigger
      {...props}
      ref={ref}
      data-ajna-component="menubar-trigger"
      data-slot="menubar-trigger"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const MenubarContent = forwardRef<HTMLDivElement, MenubarContentProps>(
  function MenubarContent(
    { align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref,
  ) {
    return (
      <DropdownMenu.Content
        {...props}
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      />
    );
  },
);
export const MenubarGroup = DropdownMenu.Group;
export const MenubarItem = DropdownMenu.Item;
export const MenubarLinkItem = DropdownMenu.LinkItem;
export const MenubarLabel = DropdownMenu.Label;
export const MenubarSeparator = DropdownMenu.Separator;
export const MenubarShortcut = DropdownMenu.Shortcut;
export const MenubarCheckboxItem = DropdownMenu.CheckboxItem;
export const MenubarRadioGroup = DropdownMenu.RadioGroup;
export const MenubarRadioItem = DropdownMenu.RadioItem;
export const MenubarSub = DropdownMenu.Sub;
export const MenubarSubTrigger = DropdownMenu.SubTrigger;
export const MenubarSubContent = DropdownMenu.SubContent;

export type {
  DropdownMenuGroupProps as MenubarGroupProps,
  DropdownMenuItemProps as MenubarItemProps,
  DropdownMenuLinkItemProps as MenubarLinkItemProps,
  DropdownMenuLabelProps as MenubarLabelProps,
  DropdownMenuSeparatorProps as MenubarSeparatorProps,
  DropdownMenuShortcutProps as MenubarShortcutProps,
  DropdownMenuCheckboxItemProps as MenubarCheckboxItemProps,
  DropdownMenuRadioGroupProps as MenubarRadioGroupProps,
  DropdownMenuRadioItemProps as MenubarRadioItemProps,
  DropdownMenuSubProps as MenubarSubProps,
  DropdownMenuSubTriggerProps as MenubarSubTriggerProps,
  DropdownMenuSubContentProps as MenubarSubContentProps,
} from "@/components/dropdown-menu";

export const Menubar = Object.assign(MenubarRoot, {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Portal: MenubarPortal,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Group: MenubarGroup,
  Item: MenubarItem,
  LinkItem: MenubarLinkItem,
  Label: MenubarLabel,
  Separator: MenubarSeparator,
  Shortcut: MenubarShortcut,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Sub: MenubarSub,
  SubTrigger: MenubarSubTrigger,
  SubContent: MenubarSubContent,
});
