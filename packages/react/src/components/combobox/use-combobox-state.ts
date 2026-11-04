"use client";

import { type RefObject, useEffect, useState } from "react";

import type { ComboboxInputChangeDetails } from "./combobox.types";

export function inputChangeDetails(
  source: ComboboxInputChangeDetails,
): ComboboxInputChangeDetails {
  return {
    ...source,
    reason: "input-clear",
    isCanceled: false,
    isPropagationAllowed: false,
    cancel() {
      this.isCanceled = true;
    },
    allowPropagation() {
      this.isPropagationAllowed = true;
    },
  };
}
export function useComboboxState<Value>(
  controlled: Value | undefined,
  defaultValue: Value,
) {
  const [internal, setInternal] = useState(defaultValue);
  return [
    controlled === undefined ? internal : controlled,
    setInternal,
  ] as const;
}
export function useComboboxFormReset(
  input: RefObject<HTMLInputElement | null>,
  form: string | undefined,
  reset: () => void,
) {
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner) return;
    const handleReset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) reset();
      });
    owner.addEventListener("reset", handleReset);
    return () => owner.removeEventListener("reset", handleReset);
  }, [input, form, reset]);
}
