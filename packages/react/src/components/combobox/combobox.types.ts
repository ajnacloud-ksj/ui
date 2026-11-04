import type { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import type {
  AriaAttributes,
  CSSProperties,
  FocusEventHandler,
  ReactNode,
  RefAttributes,
} from "react";

import type {
  ComboboxChipsInputProps,
  ComboboxContentProps,
  ComboboxValue,
} from "./combobox-parts";

export interface ComboboxOption<Value extends ComboboxValue = string> {
  label: string;
  value: Value;
  disabled?: boolean;
}
export type ComboboxSelection<
  Value extends ComboboxValue,
  Multiple extends boolean,
> = Multiple extends true ? Value[] : Value | null;
export type ComboboxSelectionDisplay = "pills" | "names" | "count";
export type ComboboxClassNames = Partial<
  Record<
    | "control"
    | "input"
    | "selectedValues"
    | "pill"
    | "pillRemove"
    | "overflow"
    | "clear"
    | "trigger"
    | "popup"
    | "list"
    | "option"
    | "groupLabel"
    | "empty"
    | "status"
    | "footer",
    string
  >
>;
export interface ComboboxMessages {
  clear: string;
  remove: (label: string) => string;
  selectedCount: (count: number) => string;
  overflowCount: (count: number) => string;
}
export type ComboboxValueChangeDetails<Option> =
  BaseCombobox.Root.ChangeEventDetails & { selectedOptions: Option[] };
export type ComboboxInputChangeDetails = BaseCombobox.Root.ChangeEventDetails;
export type ComboboxOpenChangeDetails =
  BaseCombobox.Root.OpenChangeEventDetails;
export interface ComboboxRenderOptionState {
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
  inputValue: string;
}
export interface ComboboxSelectedOptionContext<
  Option,
  Value extends ComboboxValue,
> {
  value: Value;
  option: Option | undefined;
  label: string;
}
export interface ComboboxFooterContext<
  Option,
  Value extends ComboboxValue,
  Multiple extends boolean,
> {
  inputValue: string;
  value: ComboboxSelection<NoInfer<Value>, Multiple>;
  selectedOptions: Option[];
  close: () => void;
}
export type ComboboxInputPropsExtra = Omit<
  ComboboxChipsInputProps,
  | "ref"
  | "render"
  | "children"
  | "type"
  | "value"
  | "defaultValue"
  | "name"
  | "id"
  | "form"
  | "required"
  | "disabled"
  | "readOnly"
  | "placeholder"
>;
export type ComboboxPopupProps = Pick<
  ComboboxContentProps,
  | "container"
  | "keepMounted"
  | "side"
  | "align"
  | "sideOffset"
  | "alignOffset"
  | "collisionBoundary"
  | "collisionPadding"
>;

type Accessors<Option> = ([Option] extends [{ label: string }]
  ? { getLabel?: (option: Option) => string }
  : { getLabel: (option: Option) => string }) &
  ([Option] extends [{ value: ComboboxValue }]
    ? unknown
    : { getValue: unknown });
export type ComboboxOptionValue<Option> = [Option] extends [never]
  ? ComboboxValue
  : Option extends {
        value: infer Value extends ComboboxValue;
      }
    ? Value
    : ComboboxValue;

export type ComboboxProps<
  Option = ComboboxOption,
  Value extends ComboboxValue = ComboboxOptionValue<Option>,
  Multiple extends boolean = false,
> = AriaAttributes &
  RefAttributes<HTMLInputElement> &
  Accessors<Option> & {
    options: readonly Option[];
    getValue?: (option: Option) => Value;
    selectedOptions?: readonly Option[];
    isOptionDisabled?: (option: Option) => boolean;
    getMissingLabel?: (value: Value) => string;
    value?: Multiple extends true ? readonly Value[] : Value | null;
    defaultValue?: Multiple extends true ? readonly Value[] : Value | null;
    onValueChange?: (
      value: ComboboxSelection<NoInfer<Value>, Multiple>,
      details: ComboboxValueChangeDetails<Option>,
    ) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (
      value: string,
      details: ComboboxInputChangeDetails,
    ) => void;
    filterOption?: null | ((option: Option, query: string) => boolean);
    closeOnSelect?: boolean;
    clearSearchOnSelect?: boolean;
    hideSelectedOptions?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: ComboboxOpenChangeDetails) => void;
    selectionDisplay?: ComboboxSelectionDisplay;
    maxVisibleSelections?: number;
    renderSelectedOption?: (
      context: ComboboxSelectedOptionContext<Option, Value>,
    ) => ReactNode;
    renderOption?: (
      option: Option,
      state: ComboboxRenderOptionState,
    ) => ReactNode;
    groupBy?: (option: Option) => string;
    renderGroupLabel?: (label: string) => ReactNode;
    footer?:
      | ReactNode
      | ((
          context: ComboboxFooterContext<Option, Value, Multiple>,
        ) => ReactNode);
    isLoading?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    emptyContent?: ReactNode;
    loadingContent?: ReactNode;
    messages?: Partial<ComboboxMessages>;
    id?: string;
    name?: string;
    form?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    onFocus?: FocusEventHandler<HTMLElement>;
    onBlur?: FocusEventHandler<HTMLElement>;
    inputProps?: ComboboxInputPropsExtra;
    popupProps?: ComboboxPopupProps;
    size?: "sm" | "base";
    classNames?: ComboboxClassNames;
    className?: string;
    style?: CSSProperties;
  } & (Multiple extends true
    ? { multiple: Multiple }
    : { multiple?: Multiple });
