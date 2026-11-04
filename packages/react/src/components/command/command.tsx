"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Check, Search, X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { Button } from "@/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  type DialogProps,
  DialogTitle,
} from "@/components/dialog";
import { cn } from "@/utils";

export type CommandProps = ComponentPropsWithoutRef<typeof CommandPrimitive>;
export interface CommandDialogProps extends Omit<DialogProps, "children"> {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: ReactNode;
}
export type CommandInputProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;
export type CommandListProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;
export type CommandEmptyProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;
export type CommandGroupProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;
export type CommandSeparatorProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;
export type CommandItemProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;
export type CommandShortcutProps = ComponentPropsWithoutRef<"span">;

export const Command = forwardRef<HTMLDivElement, CommandProps>(
  function Command({ className, ...props }, ref) {
    return (
      <CommandPrimitive
        {...props}
        ref={ref}
        data-ajna-component="command"
        data-slot="command"
        className={cn(
          "box-border flex h-full w-full min-w-0 flex-col overflow-hidden rounded-ajna-base bg-ajna-popover font-ajna text-sm text-ajna-popover-foreground",
          className,
        )}
      />
    );
  },
);
Command.displayName = "Command";

export function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        size="lg"
        className={cn(
          "gap-0 overflow-hidden p-0",
          showCloseButton && "[&_[data-slot=command-input]]:pe-10",
          className,
        )}
      >
        <div data-ajna-component="command-dialog-header" className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        {children}
        {showCloseButton && (
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label="Close"
              />
            }
            className="absolute end-2 top-2"
          >
            <X size={16} aria-hidden="true" />
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  function CommandInput({ className, ...props }, ref) {
    return (
      <div
        data-ajna-component="command-input-wrapper"
        data-slot="command-input-wrapper"
        className="box-border flex items-center gap-2 border-0 border-b border-solid border-ajna-border px-3"
      >
        <Search
          size={20}
          className="shrink-0 text-ajna-muted-foreground"
          aria-hidden="true"
        />
        <CommandPrimitive.Input
          {...props}
          ref={ref}
          data-ajna-component="command-input"
          data-slot="command-input"
          className={cn(
            "m-0 box-border h-12 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-3 font-ajna text-base text-ajna-popover-foreground outline-none placeholder:text-ajna-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        />
      </div>
    );
  },
);
CommandInput.displayName = "CommandInput";

export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  function CommandList({ className, ...props }, ref) {
    return (
      <CommandPrimitive.List
        {...props}
        ref={ref}
        data-ajna-component="command-list"
        data-slot="command-list"
        className={cn(
          "box-border max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden outline-none",
          className,
        )}
      />
    );
  },
);
CommandList.displayName = "CommandList";

export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  function CommandEmpty({ className, ...props }, ref) {
    return (
      <CommandPrimitive.Empty
        {...props}
        ref={ref}
        data-ajna-component="command-empty"
        data-slot="command-empty"
        className={cn(
          "box-border py-6 text-center text-sm text-ajna-muted-foreground",
          className,
        )}
      />
    );
  },
);
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  function CommandGroup({ className, ...props }, ref) {
    return (
      <CommandPrimitive.Group
        {...props}
        ref={ref}
        data-ajna-component="command-group"
        data-slot="command-group"
        className={cn(
          "box-border overflow-hidden p-1 text-ajna-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-ajna-muted-foreground",
          className,
        )}
      />
    );
  },
);
CommandGroup.displayName = "CommandGroup";

export const CommandSeparator = forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      {...props}
      ref={ref}
      data-ajna-component="command-separator"
      data-slot="command-separator"
      className={cn("box-border h-px bg-ajna-border", className)}
    />
  );
});
CommandSeparator.displayName = "CommandSeparator";

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  function CommandItem({ className, children, ...props }, ref) {
    return (
      <CommandPrimitive.Item
        {...props}
        ref={ref}
        data-ajna-component="command-item"
        data-slot="command-item"
        className={cn(
          "group/command-item relative box-border flex cursor-default select-none items-center gap-2 rounded-ajna-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-ajna-accent data-[selected=true]:text-ajna-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          className,
        )}
      >
        {children}
        <Check
          aria-hidden="true"
          data-ajna-component="command-item-indicator"
          data-slot="command-item-indicator"
          className="ms-auto h-4 w-4 opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
        />
      </CommandPrimitive.Item>
    );
  },
);
CommandItem.displayName = "CommandItem";

export const CommandShortcut = forwardRef<
  HTMLSpanElement,
  CommandShortcutProps
>(function CommandShortcut({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      data-ajna-component="command-shortcut"
      data-slot="command-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-ajna-muted-foreground",
        className,
      )}
    />
  );
});
CommandShortcut.displayName = "CommandShortcut";
