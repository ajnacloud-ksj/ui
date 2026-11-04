"use client";

import { OTPField } from "@base-ui/react/otp-field";
import { Minus } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type InputOTPProps = ComponentPropsWithoutRef<typeof OTPField.Root>;
export type InputOTPGroupProps = ComponentPropsWithoutRef<"div">;
export type InputOTPSlotProps = ComponentPropsWithoutRef<typeof OTPField.Input>;
export type InputOTPSeparatorProps = ComponentPropsWithoutRef<
  typeof OTPField.Separator
>;

export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(
  function InputOTP({ className, ...props }, ref) {
    const styles =
      "group/input-otp inline-flex max-w-full items-center gap-2 font-ajna text-ajna-foreground data-[disabled]:opacity-50";
    return (
      <OTPField.Root
        {...props}
        ref={ref}
        data-ajna-component="input-otp"
        data-slot="input-otp"
        className={
          typeof className === "function"
            ? (state) => cn(styles, className(state))
            : cn(styles, className)
        }
      />
    );
  },
);

export const InputOTPGroup = forwardRef<HTMLDivElement, InputOTPGroupProps>(
  function InputOTPGroup({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="input-otp-group"
        data-slot="input-otp-group"
        className={cn("flex items-center", className)}
      />
    );
  },
);

export const InputOTPSlot = forwardRef<HTMLInputElement, InputOTPSlotProps>(
  function InputOTPSlot({ className, ...props }, ref) {
    const styles =
      "relative m-0 box-border flex h-9 w-9 min-w-0 items-center justify-center border-y border-e border-solid border-ajna-input bg-ajna-background p-0 text-center font-ajna text-sm leading-5 text-ajna-foreground shadow-sm outline-none transition-[border-color,box-shadow] first:rounded-s-ajna-base first:border-s last:rounded-e-ajna-base placeholder:text-ajna-muted-foreground focus:z-10 focus:border-ajna-ring focus:ring-[3px] focus:ring-ajna-ring/50 aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[invalid]:border-ajna-destructive data-[invalid]:ring-[3px] data-[invalid]:ring-ajna-destructive/20 disabled:cursor-not-allowed disabled:bg-ajna-muted group-aria-[invalid=true]/input-otp:border-ajna-destructive group-aria-[invalid=true]/input-otp:ring-[3px] group-aria-[invalid=true]/input-otp:ring-ajna-destructive/20 motion-reduce:transition-none";
    return (
      <OTPField.Input
        {...props}
        ref={ref}
        data-slot="input-otp-slot"
        data-ajna-component="input-otp-slot"
        className={
          typeof className === "function"
            ? (state) => cn(styles, className(state))
            : cn(styles, className)
        }
      />
    );
  },
);

export const InputOTPSeparator = forwardRef<
  HTMLDivElement,
  InputOTPSeparatorProps
>(function InputOTPSeparator({ className, children, ...props }, ref) {
  const styles = "flex items-center text-ajna-muted-foreground";
  return (
    <OTPField.Separator
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="input-otp-separator"
      data-slot="input-otp-separator"
      className={
        typeof className === "function"
          ? (state) => cn(styles, className(state))
          : cn(styles, className)
      }
    >
      {children ?? (
        <Minus
          aria-hidden="true"
          data-ajna-component="input-otp-separator-icon"
          className="h-4 w-4"
        />
      )}
    </OTPField.Separator>
  );
});
