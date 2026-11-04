"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
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

export interface PasswordInputProps extends Omit<
  InputGroupInputProps,
  "type" | "render" | "children"
> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  containerProps?: Omit<InputGroupProps, "children">;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      id,
      disabled,
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      containerProps,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const input = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    useImperativeHandle(ref, () => input.current!, []);
    const Icon = visible ? EyeOff : Eye;
    function toggle() {
      const element = input.current;
      if (!element || element.disabled) return;
      const focused = element.ownerDocument.activeElement === element;
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const direction = element.selectionDirection;
      setVisible((current) => !current);
      if (focused && start !== null && end !== null) {
        element.ownerDocument.defaultView?.requestAnimationFrame(() => {
          if (element.ownerDocument.activeElement === element)
            element.setSelectionRange(start, end, direction ?? undefined);
        });
      }
    }
    return (
      <InputGroup {...containerProps}>
        <InputGroupInput
          {...props}
          ref={input}
          id={inputId}
          type={visible ? "text" : "password"}
          disabled={disabled}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            disabled={disabled}
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            aria-controls={inputId}
            onPointerDown={(event) => {
              if (event.button === 0) {
                event.preventDefault();
                input.current?.focus({ preventScroll: true });
              }
            }}
            onClick={toggle}
          >
            <Icon
              data-ajna-component="password-input-visibility-icon"
              className="h-4 w-4"
              aria-hidden="true"
              focusable="false"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
