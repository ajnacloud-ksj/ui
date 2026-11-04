"use client";

import {
  AlertDialog,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";
import {
  type ReactElement,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";

export interface ConfirmActionProps {
  trigger: ReactElement;
  title: string;
  description: ReactNode;
  confirmationText?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmationText,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const id = useId();
  const matches = confirmationText === undefined || typed === confirmationText;

  async function confirm() {
    if (inFlight.current || !matches) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await onConfirm();
      setOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The action could not be completed. Try again.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (inFlight.current) {
          details.cancel();
          return;
        }
        setOpen(next);
        if (next) {
          setTyped("");
          setError("");
        }
      }}
    >
      <AlertDialog.Trigger render={trigger} />
      <AlertDialog.Content aria-busy={pending}>
        <AlertDialog.Header>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        {confirmationText !== undefined && (
          <Field>
            <FieldLabel htmlFor={id}>
              Type <span className="font-semibold">{confirmationText}</span> to
              confirm
            </FieldLabel>
            <Input
              id={id}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={pending}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          </Field>
        )}
        {error && (
          <FieldError id={`${id}-error`} role="alert">
            {error}
          </FieldError>
        )}
        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={pending}>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action
            variant={destructive ? "destructive" : "primary"}
            disabled={!matches}
            loading={pending}
            onClick={() => void confirm()}
          >
            {confirmLabel}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
