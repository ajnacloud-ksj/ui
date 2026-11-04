"use client";

import { OTPInput, OTPInputContext, type OTPInputProps } from "input-otp";
import { Minus } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef, useContext } from "react";

import { cn } from "@/utils";

export {
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";
export type InputOTPProps = OTPInputProps;
export type InputOTPGroupProps = ComponentPropsWithoutRef<"div">;
export interface InputOTPSlotProps extends ComponentPropsWithoutRef<"div"> {
  index: number;
}
export type InputOTPSeparatorProps = ComponentPropsWithoutRef<"div">;

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  function InputOTP({ className, containerClassName, ...props }, ref) {
    return (
      <div
        dir={props.dir}
        data-ajna-component="input-otp-container"
        data-slot="input-otp-container"
        data-disabled={props.disabled || undefined}
        data-invalid={
          props["aria-invalid"] === true ||
          props["aria-invalid"] === "true" ||
          undefined
        }
        className={cn(
          "group/input-otp inline-flex max-w-full items-center font-ajna text-ajna-foreground data-[disabled]:opacity-50 [&>[data-input-otp-container]]:flex [&>[data-input-otp-container]]:items-center [&>[data-input-otp-container]]:gap-2",
          containerClassName,
        )}
      >
        <OTPInput
          {...props}
          ref={ref}
          spellCheck={props.spellCheck ?? false}
          data-slot="input-otp"
          data-ajna-component="input-otp"
          className={cn("disabled:cursor-not-allowed", className)}
        />
      </div>
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
export const InputOTPSlot = forwardRef<HTMLDivElement, InputOTPSlotProps>(
  function InputOTPSlot({ index, className, ...props }, ref) {
    const context = useContext(OTPInputContext);
    const { char, placeholderChar, hasFakeCaret, isActive } =
      context?.slots[index] ?? {};
    return (
      <div
        {...props}
        ref={ref}
        data-slot="input-otp-slot"
        data-ajna-component="input-otp-slot"
        data-active={isActive || undefined}
        aria-hidden="true"
        className={cn(
          "relative box-border flex h-9 w-9 items-center justify-center border-y border-e border-solid border-ajna-input bg-ajna-background font-ajna text-sm leading-5 text-ajna-foreground shadow-sm outline-none transition-[border-color,box-shadow] first:rounded-s-ajna-base first:border-s last:rounded-e-ajna-base aria-[invalid=true]:border-ajna-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-ajna-destructive/20 data-[active]:z-10 data-[active]:border-ajna-ring data-[active]:ring-[3px] data-[active]:ring-ajna-ring/50 group-data-[invalid]/input-otp:border-ajna-destructive group-data-[disabled]/input-otp:bg-ajna-muted group-data-[invalid]/input-otp:ring-[3px] group-data-[invalid]/input-otp:ring-ajna-destructive/20 motion-reduce:transition-none",
          className,
        )}
      >
        {char ?? (
          <span
            data-ajna-component="input-otp-placeholder"
            className="text-ajna-muted-foreground"
          >
            {placeholderChar}
          </span>
        )}
        {hasFakeCaret && (
          <div
            data-ajna-component="input-otp-caret"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div
              data-ajna-component="input-otp-caret-line"
              className="h-4 w-px animate-pulse bg-ajna-foreground motion-reduce:animate-none"
            />
          </div>
        )}
      </div>
    );
  },
);
export const InputOTPSeparator = forwardRef<
  HTMLDivElement,
  InputOTPSeparatorProps
>(function InputOTPSeparator({ className, children, ...props }, ref) {
  return (
    <div
      role="separator"
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="input-otp-separator"
      data-slot="input-otp-separator"
      className={cn("flex items-center text-ajna-muted-foreground", className)}
    >
      {children ?? (
        <Minus
          aria-hidden="true"
          data-ajna-component="input-otp-separator-icon"
          className="h-4 w-4"
        />
      )}
    </div>
  );
});
