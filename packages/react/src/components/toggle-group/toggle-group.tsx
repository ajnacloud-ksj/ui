"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import {
  createContext,
  forwardRef,
  type ReactElement,
  type RefAttributes,
  useContext,
} from "react";

import {
  type ToggleProps,
  type ToggleVariantProps,
  toggleVariants,
} from "@/components/toggle";
import { cn } from "@/utils";

export type ToggleGroupSpacing = 0 | 1 | 2 | 3 | 4;
export type ToggleGroupProps<Value extends string = string> = Omit<
  BaseToggleGroup.Props<Value>,
  "ref"
> &
  ToggleVariantProps & { spacing?: ToggleGroupSpacing };
export type ToggleGroupItemProps<Value extends string = string> = Omit<
  ToggleProps<Value>,
  "value" | "pressed" | "defaultPressed"
> & { value: Value };

const ToggleGroupContext = createContext<Required<ToggleVariantProps>>({
  variant: "default",
  size: "base",
});
const gaps = { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4" };
const joined = {
  horizontal:
    "[&>[data-slot=toggle-group-item]:not(:first-child)]:rounded-s-none [&>[data-slot=toggle-group-item]:not(:last-child)]:rounded-e-none [&>[data-slot=toggle-group-item]+[data-slot=toggle-group-item]]:border-s-0",
  vertical:
    "[&>[data-slot=toggle-group-item]:not(:first-child)]:rounded-t-none [&>[data-slot=toggle-group-item]:not(:last-child)]:rounded-b-none [&>[data-slot=toggle-group-item]+[data-slot=toggle-group-item]]:border-t-0",
};

const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    {
      variant = "default",
      size = "base",
      spacing = 2,
      orientation = "horizontal",
      className,
      children,
      ...props
    },
    ref,
  ) {
    const classes = cn(
      "box-border flex w-fit max-w-full items-center font-ajna text-ajna-foreground [&>[data-slot=toggle-group-item]:focus-visible]:relative [&>[data-slot=toggle-group-item]:focus-visible]:z-10",
      orientation === "vertical" && "flex-col items-stretch",
      gaps[spacing],
      spacing === 0 && joined[orientation],
    );
    return (
      <BaseToggleGroup
        {...props}
        ref={ref}
        orientation={orientation}
        data-ajna-component="toggle-group"
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {children}
        </ToggleGroupContext.Provider>
      </BaseToggleGroup>
    );
  },
);
ToggleGroupRoot.displayName = "ToggleGroup";
export const ToggleGroup = ToggleGroupRoot as <Value extends string = string>(
  props: ToggleGroupProps<Value> & RefAttributes<HTMLDivElement>,
) => ReactElement;

const ToggleGroupItemRoot = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    { variant: variantProp, size: sizeProp, className, ...props },
    ref,
  ) {
    const context = useContext(ToggleGroupContext);
    const variant = variantProp ?? context.variant;
    const size = sizeProp ?? context.size;
    const classes = toggleVariants({
      variant,
      size,
    });
    return (
      <BaseToggle
        {...props}
        ref={ref}
        data-ajna-component="toggle-group-item"
        data-slot="toggle-group-item"
        data-variant={variant}
        data-size={size}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ToggleGroupItemRoot.displayName = "ToggleGroupItem";
export const ToggleGroupItem = ToggleGroupItemRoot as <
  Value extends string = string,
>(
  props: ToggleGroupItemProps<Value> & RefAttributes<HTMLButtonElement>,
) => ReactElement;
