"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        aria-hidden="true"
        {...props}
        ref={ref}
        data-ajna-component="skeleton"
        data-slot="skeleton"
        className={cn(
          "relative box-border overflow-hidden rounded-ajna-base bg-ajna-muted after:pointer-events-none after:absolute after:inset-0 after:animate-ajna-shimmer after:bg-[linear-gradient(90deg,transparent,hsl(var(--ajna-foreground)_/_0.08),transparent)] after:content-[''] motion-reduce:after:hidden motion-reduce:after:animate-none",
          className,
        )}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
