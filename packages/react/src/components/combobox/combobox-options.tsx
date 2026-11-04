"use client";

import type { ReactNode } from "react";

import type {
  ComboboxClassNames,
  ComboboxRenderOptionState,
} from "./combobox.types";
import type { ComboboxValue } from "./combobox-parts";
import * as Parts from "./combobox-parts";
import type { ComboboxRecord } from "./use-combobox-options";

type Record = ComboboxRecord<unknown, ComboboxValue>;
interface OptionsProps {
  visible: Record[];
  groups: Map<string, Record[]>;
  grouped: boolean;
  query: string;
  isLoading: boolean;
  classNames: ComboboxClassNames;
  renderOption?: (
    option: unknown,
    state: ComboboxRenderOptionState,
  ) => ReactNode;
  renderGroupLabel?: (label: string) => ReactNode;
}
export function ComboboxOptions({
  visible,
  groups,
  grouped,
  query,
  isLoading,
  classNames,
  renderOption,
  renderGroupLabel,
}: OptionsProps) {
  function item(record: ComboboxRecord<unknown, ComboboxValue>) {
    return (
      <Parts.ComboboxItem
        key={`${typeof record.value}:${record.value}`}
        value={record.value}
        disabled={record.disabled}
        className={classNames.option}
        {...(renderOption
          ? {
              showIndicator: false,
              render: (props, state) => (
                <div {...props}>
                  {renderOption(record.option, {
                    ...state,
                    inputValue: query,
                  })}
                  <Parts.ComboboxItemIndicator />
                </div>
              ),
            }
          : {})}
      >
        {renderOption ? undefined : record.label}
      </Parts.ComboboxItem>
    );
  }
  return (
    <Parts.ComboboxList
      aria-busy={isLoading || undefined}
      className={classNames.list}
    >
      {grouped
        ? [...groups].map(([label, records]) => (
            <Parts.ComboboxGroup key={label}>
              <Parts.ComboboxGroupLabel className={classNames.groupLabel}>
                {renderGroupLabel ? renderGroupLabel(label) : label}
              </Parts.ComboboxGroupLabel>
              {records.map(item)}
            </Parts.ComboboxGroup>
          ))
        : visible.map(item)}
    </Parts.ComboboxList>
  );
}
