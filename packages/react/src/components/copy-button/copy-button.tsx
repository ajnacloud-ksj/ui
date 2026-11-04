"use client";

import { Check, CircleAlert, Copy } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";

import {
  Button,
  type ButtonProps,
  type ButtonShape,
} from "@/components/button";
import { Spinner } from "@/components/spinner";

export interface CopyButtonProps extends Omit<
  ButtonProps,
  "value" | "type" | "icon" | "loading" | "shape"
> {
  /** Plain text written to the clipboard. */
  value: string;
  /** Defaults to square for icon-only buttons and base when children are given. */
  shape?: ButtonShape;
  copyLabel?: string;
  copiedLabel?: string;
  errorLabel?: string;
  /** How long success or error feedback remains visible. @default 1500 */
  resetDelay?: number;
  onCopySuccess?: (value: string) => void;
  onCopyError?: (error: Error) => void;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      children,
      shape = children == null ? "square" : "base",
      variant = "ghost",
      copyLabel = "Copy to clipboard",
      copiedLabel = "Copied",
      errorLabel = "Could not copy",
      resetDelay = 1500,
      onCopySuccess,
      onCopyError,
      onClick,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) {
    const labelId = useId();
    const [feedback, setFeedback] = useState<{
      value: string;
      status: "pending" | "copied" | "error";
    } | null>(null);
    const request = useRef(0);
    const pending = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const status =
      feedback?.status === "pending" || feedback?.value === value
        ? feedback?.status
        : null;

    useEffect(() => {
      return () => {
        request.current += 1;
        pending.current = false;
        clearTimeout(timer.current);
      };
    }, []);

    async function copy() {
      const id = ++request.current;
      pending.current = true;
      clearTimeout(timer.current);
      setFeedback({ value, status: "pending" });
      let error: Error | undefined;
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard access is unavailable.");
        }
        await navigator.clipboard.writeText(value);
      } catch (cause) {
        error = cause instanceof Error ? cause : new Error(String(cause));
      }
      if (id !== request.current) return;
      pending.current = false;
      setFeedback({ value, status: error ? "error" : "copied" });
      timer.current = setTimeout(() => setFeedback(null), resetDelay);
      if (error) onCopyError?.(error);
      else onCopySuccess?.(value);
    }

    const nameProps = ariaLabelledby
      ? { "aria-labelledby": ariaLabelledby }
      : ariaLabel
        ? { "aria-label": ariaLabel }
        : { "aria-labelledby": labelId };
    const shapeProps: ButtonProps =
      shape === "base" ? { shape, ...nameProps } : { shape, ...nameProps };

    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant={variant}
        {...shapeProps}
        aria-busy={status === "pending" || props["aria-busy"] || undefined}
        aria-disabled={
          status === "pending" || props["aria-disabled"] || undefined
        }
        icon={
          status === "pending" ? (
            <Spinner size={14} aria-hidden="true" />
          ) : status === "copied" ? (
            <Check />
          ) : status === "error" ? (
            <CircleAlert />
          ) : (
            <Copy />
          )
        }
        data-copy-state={status ?? "idle"}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            pending.current ||
            props["aria-disabled"] === true ||
            props["aria-disabled"] === "true"
          )
            return;
          void copy();
        }}
      >
        <span
          id={labelId}
          data-ajna-component="copy-button-label"
          className={children == null ? "sr-only" : undefined}
        >
          {children == null
            ? copyLabel
            : status === "copied"
              ? copiedLabel
              : status === "error"
                ? errorLabel
                : children}
        </span>
        <span
          data-ajna-component="copy-button-status"
          className="sr-only"
          role="status"
        >
          {status === "copied"
            ? copiedLabel
            : status === "error"
              ? errorLabel
              : ""}
        </span>
      </Button>
    );
  },
);
CopyButton.displayName = "CopyButton";
