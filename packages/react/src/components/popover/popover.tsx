"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type PopoverRootProps<Payload = unknown> =
  BasePopover.Root.Props<Payload>;
export type PopoverTriggerProps<Payload = unknown> = Omit<
  BasePopover.Trigger.Props<Payload>,
  "ref"
>;
export type PopoverCloseProps = ComponentPropsWithoutRef<
  typeof BasePopover.Close
>;
export type PopoverTitleProps = ComponentPropsWithoutRef<
  typeof BasePopover.Title
>;
export type PopoverDescriptionProps = ComponentPropsWithoutRef<
  typeof BasePopover.Description
>;
export type PopoverHeaderProps = ComponentPropsWithoutRef<"div">;
export interface PopoverContentProps
  extends
    ComponentPropsWithoutRef<typeof BasePopover.Popup>,
    Pick<
      BasePopover.Positioner.Props,
      | "anchor"
      | "side"
      | "align"
      | "sideOffset"
      | "alignOffset"
      | "collisionPadding"
      | "collisionBoundary"
    > {
  /** Portal destination. Defaults to document.body. */
  container?: BasePopover.Portal.Props["container"];
  keepMounted?: boolean;
}

const contentClasses =
  "box-border flex max-h-[var(--available-height)] w-72 max-w-[var(--available-width)] origin-[var(--transform-origin)] flex-col gap-4 overflow-y-auto rounded-ajna-lg border border-solid border-ajna-border bg-ajna-popover p-4 font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ajna-ring transition-[opacity,transform] duration-150 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none motion-reduce:transition-none";

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      anchor,
      side = "bottom",
      align = "center",
      sideOffset = 8,
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
      <BasePopover.Portal
        container={container}
        keepMounted={keepMounted}
        data-ajna-component="popover-portal"
        className="relative z-[1100]"
      >
        <BasePopover.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          collisionBoundary={collisionBoundary}
          data-ajna-component="popover-positioner"
          className="isolate z-[1100]"
        >
          <BasePopover.Popup
            {...props}
            ref={ref}
            data-ajna-component="popover-content"
            data-slot="popover-content"
            className={
              typeof className === "function"
                ? (state) => cn(contentClasses, className(state))
                : cn(contentClasses, className)
            }
          />
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);
PopoverContent.displayName = "Popover.Content";

const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(
  function PopoverHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="popover-header"
        className={cn("flex flex-col gap-1", className)}
      />
    );
  },
);
PopoverHeader.displayName = "Popover.Header";

const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  function PopoverTitle({ className, ...props }, ref) {
    const classes =
      "m-0 font-ajna text-sm font-medium leading-5 text-ajna-popover-foreground";
    return (
      <BasePopover.Title
        {...props}
        ref={ref}
        data-ajna-component="popover-title"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
PopoverTitle.displayName = "Popover.Title";

const PopoverDescription = forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(function PopoverDescription({ className, ...props }, ref) {
  const classes = "m-0 font-ajna text-sm leading-5 text-ajna-muted-foreground";
  return (
    <BasePopover.Description
      {...props}
      ref={ref}
      data-ajna-component="popover-description"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
PopoverDescription.displayName = "Popover.Description";

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: BasePopover.Close,
};
