"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type KbdProps = ComponentPropsWithoutRef<"kbd">;
export type KbdGroupProps = ComponentPropsWithoutRef<"kbd">;

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, ...props },
  ref,
) {
  return (
    <kbd
      {...props}
      ref={ref}
      data-ajna-component="kbd"
      data-slot="kbd"
      className={cn(
        "pointer-events-none m-0 box-border inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 whitespace-nowrap rounded-ajna-sm border border-solid border-ajna-border bg-ajna-muted px-1 font-ajna text-[10px] font-medium leading-4 text-ajna-muted-foreground [&>svg]:h-3 [&>svg]:w-3",
        className,
      )}
    />
  );
});
Kbd.displayName = "Kbd";

export const KbdGroup = forwardRef<HTMLElement, KbdGroupProps>(
  function KbdGroup({ className, ...props }, ref) {
    return (
      <kbd
        {...props}
        ref={ref}
        data-ajna-component="kbd-group"
        data-slot="kbd-group"
        className={cn(
          "m-0 box-border inline-flex items-center gap-1 whitespace-nowrap font-ajna text-xs font-normal leading-5",
          className,
        )}
      />
    );
  },
);
KbdGroup.displayName = "KbdGroup";
