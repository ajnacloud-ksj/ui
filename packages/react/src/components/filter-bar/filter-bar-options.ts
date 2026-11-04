import type { ReactNode } from "react";

import type { FilterBarOption, FilterBarOptionValue } from "./filter-bar.types";

export interface FilterBarOptionAccessors<
  Option,
  Value extends FilterBarOptionValue,
> {
  getLabel: (option: Option) => string;
  getValue: (option: Option) => Value;
  isOptionDisabled?: (option: Option) => boolean;
  getCount?: (option: Option) => number | undefined;
  renderOption?: (option: Option) => ReactNode;
}
export function createFilterOptions<Option, Value extends FilterBarOptionValue>(
  options: readonly Option[],
  accessors: FilterBarOptionAccessors<Option, Value>,
): FilterBarOption<Value>[] {
  return options.map((option) => ({
    label: accessors.getLabel(option),
    value: accessors.getValue(option),
    disabled: accessors.isOptionDisabled?.(option),
    count: accessors.getCount?.(option),
    content: accessors.renderOption?.(option),
  }));
}
