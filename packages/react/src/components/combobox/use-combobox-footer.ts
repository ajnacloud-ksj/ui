"use client";

import { type KeyboardEvent, type RefObject, useRef } from "react";

function tabbableActions(footer: HTMLElement) {
  return [
    ...footer.querySelectorAll<HTMLElement>(
      'button,a[href],input:not([type="hidden"]),select,textarea,[tabindex],[contenteditable="true"]',
    ),
  ].filter((element) => {
    if (
      element.tabIndex < 0 ||
      element.matches(":disabled") ||
      element.closest("[hidden],[inert]")
    )
      return false;
    for (
      let node: HTMLElement | null = element;
      node;
      node = node.parentElement
    ) {
      const style = node.ownerDocument.defaultView?.getComputedStyle(node);
      if (style?.display === "none" || style?.visibility === "hidden")
        return false;
    }
    return true;
  });
}

export function useComboboxFooter(
  open: boolean,
  input: RefObject<HTMLInputElement | null>,
  control: RefObject<HTMLElement | null>,
) {
  const footer = useRef<HTMLDivElement>(null);
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (
      !open ||
      event.defaultPrevented ||
      event.key !== "Tab" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !footer.current
    )
      return;
    const actions = tabbableActions(footer.current);
    const target = event.target as Node;
    if (!event.shiftKey && control.current?.contains(target) && actions[0]) {
      event.preventDefault();
      actions[0].focus();
    } else if (footer.current.contains(target)) {
      if (event.shiftKey && target === actions[0]) {
        event.preventDefault();
        input.current?.focus();
      } else if (!event.shiftKey && target === actions[actions.length - 1]) {
        // Let the browser continue from the input's position in the form's tab order.
        input.current?.focus();
      }
    }
  }
  return { footer, onKeyDown };
}
