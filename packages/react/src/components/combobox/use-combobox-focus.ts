"use client";

import {
  type FocusEvent,
  type FocusEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";

function retainEvent(event: FocusEvent<HTMLElement>) {
  return Object.assign(Object.create(event) as FocusEvent<HTMLElement>, {
    currentTarget: event.currentTarget,
  });
}
export function useComboboxFocus(
  open: boolean,
  onFocus?: FocusEventHandler<HTMLElement>,
  onBlur?: FocusEventHandler<HTMLElement>,
) {
  const control = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const mounted = useRef(true);
  const lastEvent = useRef<FocusEvent<HTMLElement> | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const owns = useCallback(
    (node: EventTarget | null) =>
      node instanceof Node &&
      Boolean(control.current?.contains(node) || popup.current?.contains(node)),
    [],
  );
  const completeBlur = useCallback(() => {
    const event = lastEvent.current;
    if (!mounted.current || !focused.current || !event) return;
    const active = event.currentTarget.ownerDocument.activeElement;
    if (owns(active)) return;
    focused.current = false;
    onBlur?.(
      Object.assign(Object.create(event) as FocusEvent<HTMLElement>, {
        type: "blur",
        relatedTarget: active,
      }),
    );
  }, [onBlur, owns]);
  const handleFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!owns(event.target)) return;
      lastEvent.current = retainEvent(event);
      if (focused.current) return;
      focused.current = true;
      onFocus?.(event);
    },
    [onFocus, owns],
  );
  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      lastEvent.current = retainEvent(event);
      if (owns(event.relatedTarget)) return;
      // Portals and focus guards may return focus after the native blur dispatch.
      queueMicrotask(completeBlur);
    },
    [completeBlur, owns],
  );
  useEffect(() => {
    // Removing a focused popup descendant does not reliably dispatch React blur.
    if (!open) queueMicrotask(completeBlur);
  }, [open, completeBlur]);
  return {
    control,
    popup,
    onFocusCapture: handleFocus,
    onBlurCapture: handleBlur,
  };
}
