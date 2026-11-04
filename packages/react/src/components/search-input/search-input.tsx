"use client";

import { Search, X } from "lucide-react";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  type InputGroupInputProps,
  type InputGroupProps,
} from "@/components/input-group";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

export interface SearchInputProps extends Omit<
  InputGroupInputProps,
  "type" | "value" | "defaultValue" | "render" | "children"
> {
  value?: string;
  defaultValue?: string;
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  loading?: boolean;
  icon?: ReactNode;
  containerProps?: Omit<InputGroupProps, "children">;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      defaultValue,
      id,
      onChange,
      onKeyDown,
      onClear,
      clearable = true,
      clearLabel = "Clear search",
      loading = false,
      icon,
      disabled,
      readOnly,
      className,
      containerProps,
      form,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const input = useRef<HTMLInputElement>(null);
    const [filled, setFilled] = useState(Boolean(defaultValue));
    const hasValue = value === undefined ? filled : value.length > 0;
    useImperativeHandle(ref, () => input.current!, []);
    useEffect(() => {
      const element = input.current;
      const ownerForm = element?.form;
      if (!element || !ownerForm) return;
      const reset = (event: Event) =>
        queueMicrotask(() => {
          if (!event.defaultPrevented) setFilled(element.value !== "");
        });
      ownerForm.addEventListener("reset", reset);
      return () => ownerForm.removeEventListener("reset", reset);
    }, [form]);

    function clear() {
      const element = input.current;
      if (
        !element ||
        element.disabled ||
        element.readOnly ||
        element.value === ""
      )
        return;
      const ownerWindow = element.ownerDocument.defaultView!;
      // Bypass React's value tracker so clearing follows the native change path once.
      Object.getOwnPropertyDescriptor(
        ownerWindow.HTMLInputElement.prototype,
        "value",
      )!.set!.call(element, "");
      element.dispatchEvent(new ownerWindow.Event("input", { bubbles: true }));
      element.focus();
      onClear?.();
    }

    const classes =
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden";
    return (
      <InputGroup {...containerProps}>
        <InputGroupInput
          {...props}
          ref={input}
          id={inputId}
          type="search"
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          form={form}
          className={
            typeof className === "function"
              ? (state) => cn(classes, className(state))
              : cn(classes, className)
          }
          onChange={(event) => {
            onChange?.(event);
            setFilled(event.currentTarget.value !== "");
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              !event.defaultPrevented &&
              !event.nativeEvent.isComposing &&
              event.key === "Escape" &&
              clearable &&
              !disabled &&
              !readOnly &&
              event.currentTarget.value !== ""
            ) {
              event.preventDefault();
              clear();
            }
          }}
        />
        <InputGroupAddon align="inline-start" aria-hidden="true">
          {loading ? (
            <Spinner size="sm" aria-hidden="true" />
          ) : (
            (icon ?? <Search aria-hidden="true" focusable="false" />)
          )}
        </InputGroupAddon>
        {clearable && hasValue && !disabled && !readOnly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              aria-label={clearLabel}
              aria-controls={inputId}
              onClick={clear}
            >
              <X
                data-ajna-component="search-input-clear-icon"
                className="h-3.5 w-3.5"
                aria-hidden="true"
                focusable="false"
              />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
);
SearchInput.displayName = "SearchInput";
