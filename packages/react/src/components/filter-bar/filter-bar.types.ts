import type { DateValue } from "@internationalized/date";
import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
  RefObject,
} from "react";

import type { ButtonProps } from "@/components/button";
import type { DateInputProps } from "@/components/date-input";
import type { DrawerContentProps, DrawerProps } from "@/components/drawer";
import type { InputProps } from "@/components/input";
import type { NumberInputProps } from "@/components/number-input";
import type { SearchInputProps } from "@/components/search-input";

export type FilterBarOptionValue = string | number;
export interface FilterBarOption<Value extends FilterBarOptionValue = string> {
  label: string;
  value: Value;
  disabled?: boolean;
  count?: number;
  content?: ReactNode;
}
export interface FilterBarNumberRange {
  min: number | null;
  max: number | null;
}
export interface FilterBarDateRange<Value extends DateValue = DateValue> {
  start: Value | null;
  end: Value | null;
}
export type FilterBarApplyMode = "instant" | "staged";
export interface FilterBarCustomRenderProps<Value> {
  value: Value;
  resetValue: Value;
  onValueChange: (value: Value) => void;
  disabled: boolean;
  id: string;
  labelId: string;
  describedBy: string | undefined;
  error: string | undefined;
  popupContainer: RefObject<HTMLDivElement | null>;
}
interface FilterBase<Key extends string, Value> {
  id: Key;
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  isEqual?: (value: Value, other: Value) => boolean;
  isActive?: (value: Value, resetValue: Value) => boolean;
  getActiveLabel?: (value: Value) => ReactNode;
  validate?: (value: Value) => string | null | undefined;
}
interface Choice<Value extends FilterBarOptionValue> {
  options: readonly FilterBarOption<Value>[];
  placeholder?: string;
  isLoading?: boolean;
  getMissingLabel?: (value: Value) => string;
}
type DateControls<Value extends DateValue> = Omit<
  DateInputProps<Value>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "isDisabled"
  | "id"
  | "name"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-invalid"
>;
type FilterFor<Key extends string, Value> = FilterBase<Key, Value> &
  (
    | {
        type: "custom";
        render: (props: FilterBarCustomRenderProps<Value>) => ReactNode;
      }
    | ([Value] extends [boolean] ? { type: "toggle" } : never)
    | ([Value] extends [string]
        ? {
            type: "text";
            placeholder?: string;
            inputProps?: Omit<
              InputProps,
              | "value"
              | "defaultValue"
              | "onChange"
              | "disabled"
              | "id"
              | "name"
              | "render"
            >;
          }
        : never)
    | ([Value] extends [FilterBarOptionValue | null]
        ? { type: "select" } & Choice<Extract<Value, FilterBarOptionValue>>
        : never)
    | ([Value] extends [readonly (infer Item)[]]
        ? [Item] extends [FilterBarOptionValue]
          ? {
              type: "multi-select";
              searchable?: boolean;
              searchPlaceholder?: string;
            } & Choice<Extract<Item, FilterBarOptionValue>>
          : never
        : never)
    | ([Value] extends [FilterBarNumberRange]
        ? {
            type: "number-range";
            numberProps?: Pick<
              NumberInputProps,
              | "min"
              | "max"
              | "step"
              | "format"
              | "locale"
              | "suffix"
              | "showControls"
            >;
          }
        : never)
    | ([Value] extends [DateValue | null]
        ? { type: "date"; dateProps?: DateControls<Extract<Value, DateValue>> }
        : never)
    | ([Value] extends [FilterBarDateRange]
        ? {
            type: "date-range";
            dateProps?: DateControls<
              Extract<
                Value extends FilterBarDateRange<infer Date> ? Date : never,
                DateValue
              >
            >;
          }
        : never)
  );
export type FilterBarDefinition<Values extends object> = {
  [Key in Extract<keyof Values, string>]: FilterFor<Key, Values[Key]>;
}[Extract<keyof Values, string>];
export interface FilterBarChangeDetails<Values extends object> {
  reason: "change" | "apply" | "clear" | "clear-all";
  filterId?: Extract<keyof Values, string>;
}
export interface FilterBarMessages {
  filters: string;
  listControls: string;
  activeFilters: string;
  filterOptions: string;
  clearAll: string;
  clearField: string;
  apply: string;
  cancel: string;
  done: string;
  close: string;
  instantDescription: string;
  stagedDescription: string;
  search: string;
  loading: string;
  emptyOptions: string;
  minimum: string;
  maximum: string;
  startDate: string;
  endDate: string;
  invalidRange: string;
  invalidValue: string;
  removeFilter: (label: string) => string;
  activeCount: (count: number) => string;
  selectedCount: (count: number) => string;
  overflowCount: (count: number) => string;
  selection: (labels: readonly string[]) => string;
  range: (start: string | null, end: string | null) => string;
}
export type FilterBarSearchProps = Omit<
  SearchInputProps,
  "value" | "defaultValue" | "onChange" | "name" | "form"
> & {
  value: string;
  onValueChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
};
export type FilterBarClassNames = Partial<
  Record<
    | "toolbar"
    | "search"
    | "trigger"
    | "actions"
    | "activeFilters"
    | "chip"
    | "panel"
    | "panelHeader"
    | "panelBody"
    | "panelFooter"
    | "field",
    string
  >
>;
export interface FilterBarProps<Values extends object> extends Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "onChange" | "defaultValue"
> {
  filters: readonly FilterBarDefinition<NoInfer<Values>>[];
  value: Values;
  resetValue: NoInfer<Values>;
  onValueChange: (
    value: Values,
    details: FilterBarChangeDetails<Values>,
  ) => void;
  applyMode?: FilterBarApplyMode;
  search?: FilterBarSearchProps;
  actions?: ReactNode;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: DrawerProps["onOpenChange"];
  panelSide?: "responsive" | "bottom" | "left" | "right";
  panelProps?: Omit<DrawerContentProps, "children" | "render">;
  triggerProps?: Omit<
    ButtonProps,
    "children" | "disabled" | "type" | "onClick" | "shape"
  >;
  locale?: string;
  formatDate?: (value: DateValue) => string;
  messages?: Partial<FilterBarMessages>;
  classNames?: FilterBarClassNames;
  ref?: Ref<HTMLElement>;
}
