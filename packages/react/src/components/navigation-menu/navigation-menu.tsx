"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { forwardRef, type ReactElement, type Ref } from "react";

import { cn } from "@/utils";

export interface NavigationMenuPositionerProps
  extends BaseNavigationMenu.Positioner.Props {
  container?: BaseNavigationMenu.Portal.Props["container"];
  keepMounted?: boolean;
  popupProps?: BaseNavigationMenu.Popup.Props;
}
export interface NavigationMenuProps<Value = string> extends BaseNavigationMenu
  .Root.Props<Value> {
  align?: BaseNavigationMenu.Positioner.Props["align"];
  positionerProps?: NavigationMenuPositionerProps;
}
export type NavigationMenuListProps = BaseNavigationMenu.List.Props;
export type NavigationMenuItemProps = BaseNavigationMenu.Item.Props;
export type NavigationMenuTriggerProps = BaseNavigationMenu.Trigger.Props;
export type NavigationMenuContentProps = BaseNavigationMenu.Content.Props;
export type NavigationMenuLinkProps = BaseNavigationMenu.Link.Props;
export type NavigationMenuIndicatorProps = BaseNavigationMenu.Icon.Props;

const NavigationMenuRoot = forwardRef<
  HTMLElement,
  NavigationMenuProps<unknown>
>(function NavigationMenuRoot(
  { align = "start", positionerProps, className, children, ...props },
  ref,
) {
  const classes =
    "relative flex max-w-max flex-1 items-center justify-center font-ajna text-sm text-ajna-foreground";
  return (
    <BaseNavigationMenu.Root
      {...props}
      ref={ref}
      data-slot="navigation-menu"
      data-ajna-component="navigation-menu"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children}
      <NavigationMenuPositioner align={align} {...positionerProps} />
    </BaseNavigationMenu.Root>
  );
}) as <Value = string>(
  props: NavigationMenuProps<Value> & { ref?: Ref<HTMLElement> },
) => ReactElement;

export const NavigationMenuList = forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(function NavigationMenuList({ className, ...props }, ref) {
  const classes =
    "m-0 flex flex-1 list-none items-center justify-center gap-1 p-0";
  return (
    <BaseNavigationMenu.List
      {...props}
      ref={ref}
      data-slot="navigation-menu-list"
      data-ajna-component="navigation-menu-list"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const NavigationMenuItem = forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(function NavigationMenuItem({ className, ...props }, ref) {
  const classes = "relative list-none";
  return (
    <BaseNavigationMenu.Item
      {...props}
      ref={ref}
      data-slot="navigation-menu-item"
      data-ajna-component="navigation-menu-item"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center gap-1 rounded-ajna-base border-0 bg-ajna-background px-3 py-2 font-ajna text-sm font-medium leading-5 text-ajna-foreground no-underline outline-none transition-colors hover:bg-ajna-accent hover:text-ajna-accent-foreground focus-visible:ring-2 focus-visible:ring-ajna-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ajna-background data-[disabled]:pointer-events-none data-[popup-open]:bg-ajna-accent data-[disabled]:opacity-50 motion-reduce:transition-none",
);
export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({ className, children, ...props }, ref) {
  return (
    <BaseNavigationMenu.Trigger
      {...props}
      ref={ref}
      data-slot="navigation-menu-trigger"
      data-ajna-component="navigation-menu-trigger"
      className={
        typeof className === "function"
          ? (state) => cn(navigationMenuTriggerStyle(), className(state))
          : cn(navigationMenuTriggerStyle(), className)
      }
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        data-ajna-component="navigation-menu-chevron"
        className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-data-[popup-open]:rotate-180 motion-reduce:transition-none"
      />
    </BaseNavigationMenu.Trigger>
  );
});
export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(function NavigationMenuContent({ className, ...props }, ref) {
  const classes =
    "box-border h-full w-auto p-2 font-ajna text-sm leading-5 text-ajna-popover-foreground outline-none transition-[opacity,transform] duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[starting-style]:data-[activation-direction=left]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=right]:translate-x-1/2 data-[ending-style]:data-[activation-direction=left]:translate-x-1/2 data-[ending-style]:data-[activation-direction=right]:-translate-x-1/2 motion-reduce:transition-none";
  return (
    <BaseNavigationMenu.Content
      {...props}
      ref={ref}
      data-slot="navigation-menu-content"
      data-ajna-component="navigation-menu-content"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const NavigationMenuPositioner = forwardRef<
  HTMLDivElement,
  NavigationMenuPositionerProps
>(function NavigationMenuPositioner(
  {
    container,
    keepMounted,
    popupProps,
    side = "bottom",
    sideOffset = 8,
    align = "start",
    alignOffset = 0,
    collisionPadding = 8,
    className,
    ...props
  },
  ref,
) {
  const direction = useDirection();
  const classes =
    "isolate z-[1001] h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-200 data-[instant]:transition-none motion-reduce:transition-none";
  const popupClasses =
    "relative box-border h-[var(--popup-height)] w-[var(--popup-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] rounded-ajna-lg border border-solid border-ajna-border bg-ajna-popover font-ajna text-ajna-popover-foreground shadow-md outline-none transition-[opacity,transform,width,height] duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-reduce:transition-none";
  const popupClassName = popupProps?.className;
  return (
    <BaseNavigationMenu.Portal container={container} keepMounted={keepMounted}>
      <BaseNavigationMenu.Positioner
        {...props}
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        data-slot="navigation-menu-positioner"
        data-ajna-component="navigation-menu-positioner"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        <BaseNavigationMenu.Popup
          dir={direction}
          {...popupProps}
          data-slot="navigation-menu-popup"
          data-ajna-component="navigation-menu-popup"
          className={
            typeof popupClassName === "function"
              ? (state) => cn(popupClasses, popupClassName(state))
              : cn(popupClasses, popupClassName)
          }
        >
          <BaseNavigationMenu.Viewport
            data-slot="navigation-menu-viewport"
            data-ajna-component="navigation-menu-viewport"
            className="relative h-full w-full overflow-hidden rounded-[inherit]"
          />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  );
});
export const NavigationMenuLink = forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(function NavigationMenuLink(
  { className, closeOnClick = true, ...props },
  ref,
) {
  const classes =
    "flex flex-col gap-1 rounded-ajna-base p-3 font-ajna text-sm leading-5 text-ajna-popover-foreground no-underline outline-none transition-colors hover:bg-ajna-accent hover:text-ajna-accent-foreground focus-visible:bg-ajna-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring data-[active]:bg-ajna-accent data-[active]:text-ajna-accent-foreground motion-reduce:transition-none";
  return (
    <BaseNavigationMenu.Link
      {...props}
      ref={ref}
      closeOnClick={closeOnClick}
      data-slot="navigation-menu-link"
      data-ajna-component="navigation-menu-link"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const NavigationMenuIndicator = forwardRef<
  HTMLSpanElement,
  NavigationMenuIndicatorProps
>(function NavigationMenuIndicator({ className, children, ...props }, ref) {
  const classes =
    "inline-flex h-4 w-4 items-center justify-center transition-transform duration-150 data-[popup-open]:rotate-180 motion-reduce:transition-none";
  return (
    <BaseNavigationMenu.Icon
      aria-hidden="true"
      {...props}
      ref={ref}
      data-slot="navigation-menu-indicator"
      data-ajna-component="navigation-menu-indicator"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    >
      {children ?? (
        <ChevronDown
          aria-hidden="true"
          data-ajna-component="navigation-menu-indicator-icon"
          className="h-4 w-4"
        />
      )}
    </BaseNavigationMenu.Icon>
  );
});
export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  Root: NavigationMenuRoot,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Positioner: NavigationMenuPositioner,
});
