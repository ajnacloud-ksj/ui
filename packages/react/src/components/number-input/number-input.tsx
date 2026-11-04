"use client";

import { NumberField } from "@base-ui/react/number-field";
import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

import { cn } from "@/utils";

export interface NumberInputProps extends Omit<
  NumberField.Root.Props,
  "children" | "render"
> {
  placeholder?: string;
  suffix?: ReactNode;
  showControls?: boolean;
  incrementLabel?: string;
  decrementLabel?: string;
  inputProps?: Omit<
    NumberField.Input.Props,
    | "ref"
    | "render"
    | "type"
    | "value"
    | "defaultValue"
    | "id"
    | "name"
    | "form"
    | "disabled"
    | "readOnly"
    | "required"
  >;
}

const groupClasses =
  "box-border flex h-9 w-full min-w-0 items-center overflow-hidden rounded-ajna-base border border-solid border-ajna-input bg-ajna-input/15 font-ajna text-ajna-foreground shadow-sm transition-[border-color,box-shadow] has-[input:focus-visible]:border-ajna-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ajna-ring/50 has-[input[aria-invalid=true]]:border-ajna-destructive has-[input[aria-invalid=true]]:ring-[3px] has-[input[aria-invalid=true]]:ring-ajna-destructive/20 data-[disabled]:bg-ajna-muted data-[disabled]:opacity-50 motion-reduce:transition-none";
const controlClasses =
  "m-0 box-border h-full w-full min-w-0 flex-1 rounded-none border-0 border-solid bg-transparent px-3 py-1 font-ajna text-base font-normal leading-5 tabular-nums text-ajna-foreground shadow-none outline-none placeholder:text-ajna-muted-foreground disabled:cursor-not-allowed md:text-sm";
const stepperClasses =
  "m-0 box-border flex min-h-0 w-6 flex-1 cursor-pointer items-center justify-center border-0 border-solid border-ajna-input bg-transparent p-0 font-ajna text-ajna-muted-foreground outline-none hover:bg-ajna-accent hover:text-ajna-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      className,
      style,
      placeholder,
      suffix,
      showControls = false,
      incrementLabel = "Increase value",
      decrementLabel = "Decrease value",
      inputProps,
      ...props
    },
    ref,
  ) {
    const rootProps = { ...props };
    const inputAria: Record<string, unknown> = {};
    for (const key of Object.keys(rootProps)) {
      if (key.startsWith("aria-")) {
        inputAria[key] = rootProps[key as keyof typeof rootProps];
        delete rootProps[key as keyof typeof rootProps];
      }
    }
    const { className: inputClassName, ...controlProps } = inputProps ?? {};
    const hasSuffix = suffix !== undefined && suffix !== null && suffix !== "";
    return (
      <NumberField.Root
        {...rootProps}
        data-ajna-component="number-input"
        data-slot="number-input"
        className="box-border w-full min-w-0"
      >
        <NumberField.Group
          data-ajna-component="number-input-group"
          data-slot="number-input-group"
          style={style}
          className={
            typeof className === "function"
              ? (state) => cn(groupClasses, className(state))
              : cn(groupClasses, className)
          }
        >
          <NumberField.Input
            {...controlProps}
            {...inputAria}
            ref={ref}
            type="text"
            placeholder={placeholder ?? controlProps.placeholder}
            data-ajna-component="number-input-control"
            data-slot="number-input-control"
            className={
              typeof inputClassName === "function"
                ? (state) =>
                    cn(
                      controlClasses,
                      hasSuffix && "pe-1.5",
                      inputClassName(state),
                    )
                : cn(controlClasses, hasSuffix && "pe-1.5", inputClassName)
            }
          />
          {hasSuffix && (
            <span
              data-ajna-component="number-input-suffix"
              data-slot="number-input-suffix"
              aria-hidden="true"
              className="pointer-events-none box-border shrink-0 pe-3 text-xs leading-4 text-ajna-muted-foreground"
            >
              {suffix}
            </span>
          )}
          {showControls && (
            <div
              data-ajna-component="number-input-steppers"
              className="box-border flex h-full shrink-0 flex-col border-0 border-s border-solid border-ajna-input"
            >
              <NumberField.Increment
                aria-label={incrementLabel}
                data-ajna-component="number-input-increment"
                data-slot="number-input-increment"
                className={cn(stepperClasses, "border-b")}
              >
                <ChevronUp
                  data-ajna-component="number-input-increment-icon"
                  className="block h-3 w-3"
                  aria-hidden="true"
                  focusable="false"
                />
              </NumberField.Increment>
              <NumberField.Decrement
                aria-label={decrementLabel}
                data-ajna-component="number-input-decrement"
                data-slot="number-input-decrement"
                className={stepperClasses}
              >
                <ChevronDown
                  data-ajna-component="number-input-decrement-icon"
                  className="block h-3 w-3"
                  aria-hidden="true"
                  focusable="false"
                />
              </NumberField.Decrement>
            </div>
          )}
        </NumberField.Group>
      </NumberField.Root>
    );
  },
);
NumberInput.displayName = "NumberInput";
