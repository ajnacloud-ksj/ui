"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useMemo, useState } from "react";

import type { ComboboxValue } from "./combobox-parts";

export interface ComboboxRecord<Option, Value extends ComboboxValue> {
  value: Value;
  label: string;
  option: Option | undefined;
  disabled: boolean;
}
interface OptionsConfig<Option, Value extends ComboboxValue> {
  options: readonly Option[];
  selectedOptions: readonly Option[];
  values: readonly Value[];
  getValue: (option: Option) => Value;
  getLabel: (option: Option) => string;
  isOptionDisabled: (option: Option) => boolean;
  getMissingLabel: (value: Value) => string;
  query: string;
  filterOption: null | undefined | ((option: Option, query: string) => boolean);
  hideSelectedOptions: boolean;
  groupBy?: (option: Option) => string;
}
export function useComboboxOptions<Option, Value extends ComboboxValue>({
  options,
  selectedOptions,
  values,
  getValue,
  getLabel,
  isOptionDisabled,
  getMissingLabel,
  query,
  filterOption,
  hideSelectedOptions,
  groupBy,
}: OptionsConfig<Option, Value>) {
  const filter = BaseCombobox.useFilter({ sensitivity: "base" });
  const [cache, setCache] = useState(
    () => new Map<Value, ComboboxRecord<Option, Value>>(),
  );
  const data = useMemo(() => {
    const normalize = (option: Option): ComboboxRecord<Option, Value> => {
      const value = getValue(option);
      if (
        typeof value !== "string" &&
        (typeof value !== "number" || !Number.isFinite(value))
      )
        throw new Error(
          "Combobox getValue must return a string or finite number.",
        );
      const label = getLabel(option);
      if (typeof label !== "string")
        throw new Error("Combobox getLabel must return a string.");
      return { value, label, option, disabled: isOptionDisabled(option) };
    };
    const available = options.map(normalize);
    const seen = new Set<Value>();
    for (const item of available) {
      if (seen.has(item.value))
        throw new Error(
          `Combobox options must have unique values: ${item.value}`,
        );
      seen.add(item.value);
    }
    return { available, supplied: selectedOptions.map(normalize) };
  }, [options, selectedOptions, getValue, getLabel, isOptionDisabled]);
  const registry = useMemo(() => {
    const entries = new Map(cache);
    for (const record of [...data.supplied, ...data.available])
      entries.set(record.value, record);
    return entries;
  }, [cache, data]);
  const selection = useMemo(
    () =>
      values.map(
        (value) =>
          registry.get(value) ?? {
            value,
            label: getMissingLabel(value),
            option: undefined,
            disabled: false,
          },
      ),
    [values, registry, getMissingLabel],
  );
  const nextCache = new Map(
    selection
      .filter((record) => record.option !== undefined)
      .map((record) => [record.value, record]),
  );
  if (
    cache.size !== nextCache.size ||
    [...nextCache].some(([value, record]) => {
      const old = cache.get(value);
      return (
        !old ||
        old.option !== record.option ||
        old.label !== record.label ||
        old.disabled !== record.disabled
      );
    })
  )
    setCache(nextCache);
  const visible = data.available.filter(
    (record) =>
      (!hideSelectedOptions || !values.includes(record.value)) &&
      (filterOption === null ||
        (filterOption
          ? filterOption(record.option!, query)
          : filter.contains(record.label, query))),
  );
  const items = useMemo(
    () =>
      BaseCombobox.createItems(
        [
          ...data.available,
          ...selection.filter(
            (record) =>
              !data.available.some((item) =>
                Object.is(item.value, record.value),
              ),
          ),
        ],
        {
          getValue: (record) => record.value,
          getLabel: (record) => record.label,
        },
      ),
    [data.available, selection],
  );
  const groups = new Map<string, typeof visible>();
  if (groupBy)
    for (const record of visible) {
      const label = groupBy(record.option!);
      const group = groups.get(label) ?? [];
      group.push(record);
      groups.set(label, group);
    }
  return { items, visible, groups, selection, registry };
}
