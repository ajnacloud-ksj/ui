import type { Select as BaseSelect } from "@base-ui/react/select";
import type {
  AriaAttributes,
  CSSProperties,
  ReactNode,
  RefAttributes,
} from "react";

import type {
  SelectContentProps,
  SelectSize,
  SelectTriggerProps,
  SelectValue,
  SelectValueProps,
} from "./select-parts";

export interface SelectOption<Value extends SelectValue = string> {
  label: string;
  value: Value;
  disabled?: boolean;
}
export type SelectOptionValue<Option> = [Option] extends [never]
  ? SelectValue
  : Option extends { value: infer Value extends SelectValue }
    ? Value
    : SelectValue;
type Accessors<Option> = ([Option] extends [{ label: string }]
  ? { getLabel?: (option: Option) => string }
  : { getLabel: (option: Option) => string }) &
  ([Option] extends [{ value: SelectValue }] ? unknown : { getValue: unknown });
export type SelectChangeDetails = BaseSelect.Root.ChangeEventDetails;
export type SelectOpenChangeDetails = BaseSelect.Root.OpenChangeEventDetails;
export type SelectProps<
  Option = SelectOption,
  Value extends SelectValue = SelectOptionValue<Option>,
  Multiple extends boolean = false,
> = Omit<
  BaseSelect.Root.Props<Value, Multiple>,
  "children" | "items" | "onValueChange"
> &
  RefAttributes<HTMLButtonElement> &
  Pick<
    AriaAttributes,
    "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"
  > &
  Accessors<Option> & {
    options: readonly Option[];
    getValue?: (option: Option) => Value;
    isOptionDisabled?: (option: Option) => boolean;
    groupBy?: (option: Option) => string;
    renderGroupLabel?: (label: string) => ReactNode;
    renderOption?: (option: Option) => ReactNode;
    onValueChange?: (
      value: Multiple extends true ? NoInfer<Value>[] : NoInfer<Value> | null,
      details: SelectChangeDetails,
    ) => void;
    placeholder?: ReactNode;
    size?: SelectSize;
    className?: string;
    style?: CSSProperties;
    triggerProps?: Omit<SelectTriggerProps, "ref" | "children" | "id" | "size">;
    valueProps?: Omit<SelectValueProps, "ref">;
    contentProps?: Omit<SelectContentProps, "ref" | "children">;
  };
