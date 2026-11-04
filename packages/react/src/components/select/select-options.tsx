"use client";

import type { ReactNode } from "react";

import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  type SelectValue,
} from "./select-parts";

export interface SelectRecord<Option> {
  option: Option;
  value: SelectValue;
  label: string;
  disabled: boolean;
}
interface OptionsProps<Option> {
  records: SelectRecord<Option>[];
  groupBy?: (option: Option) => string;
  renderGroupLabel?: (label: string) => ReactNode;
  renderOption?: (option: Option) => ReactNode;
}
export function SelectOptions<Option>({
  records,
  groupBy,
  renderGroupLabel,
  renderOption,
}: OptionsProps<Option>) {
  const item = (record: SelectRecord<Option>) => (
    <SelectItem
      key={`${typeof record.value}:${record.value}`}
      value={record.value}
      label={record.label}
      disabled={record.disabled}
    >
      {renderOption ? renderOption(record.option) : record.label}
    </SelectItem>
  );
  if (!groupBy) return records.map(item);
  const groups = new Map<string, SelectRecord<Option>[]>();
  for (const record of records) {
    const label = groupBy(record.option);
    const group = groups.get(label) ?? [];
    group.push(record);
    groups.set(label, group);
  }
  return [...groups].map(([label, items], index) => (
    <SelectGroup key={label}>
      {index > 0 && <SelectSeparator />}
      <SelectLabel>
        {renderGroupLabel ? renderGroupLabel(label) : label}
      </SelectLabel>
      {items.map(item)}
    </SelectGroup>
  ));
}
