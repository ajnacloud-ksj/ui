"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        data-ajna-component="textarea"
        data-slot="textarea"
        className={cn(
          "m-0 box-border block min-h-16 w-full min-w-0 resize-y rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 px-3 py-2 font-ajna text-base leading-5 text-ajna-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-ajna-muted-foreground focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50 disabled:cursor-not-allowed disabled:bg-ajna-muted disabled:opacity-50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 motion-reduce:transition-none md:text-sm",
          className,
        )}
      />
    );
  },
);
Textarea.displayName = "Textarea";
