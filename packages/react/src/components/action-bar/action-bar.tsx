"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import {
  DirectionProvider,
  useDirection,
} from "@base-ui/react/direction-provider";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import {
  createContext,
  type CSSProperties,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import {
  Button,
  type ButtonProps,
  type ButtonVariantProps,
  buttonVariants,
} from "@/components/button";
import { Separator, type SeparatorProps } from "@/components/separator";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

export type ActionBarSide = "top" | "bottom";
export type ActionBarAlign = "start" | "center" | "end";
export type ActionBarOrientation = "horizontal" | "vertical";
export interface ActionBarState {
  open: boolean;
  side: ActionBarSide;
  align: ActionBarAlign;
  orientation: ActionBarOrientation;
}
export interface ActionBarProps extends Omit<
  useRender.ComponentProps<"div", ActionBarState>,
  "ref" | "dir"
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: ActionBarSide;
  sideOffset?: number;
  align?: ActionBarAlign;
  alignOffset?: number;
  portalContainer?: HTMLElement | DocumentFragment | null;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: "ltr" | "rtl";
  orientation?: ActionBarOrientation;
  loop?: boolean;
}
export type ActionBarSelectionProps = Omit<
  useRender.ComponentProps<"div">,
  "ref"
>;
export type ActionBarGroupProps = Omit<
  BaseToolbar.Root.Props,
  "ref" | "orientation" | "loopFocus"
>;
export interface ActionBarItemProps
  extends Omit<BaseButton.Props, "ref" | "onSelect">, ButtonVariantProps {
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  icon?: ReactNode;
}
export type ActionBarCloseProps = Omit<
  ButtonProps,
  "type" | "variant" | "size" | "shape" | "loading" | "icon"
>;
export type ActionBarSeparatorProps = SeparatorProps;

const GroupContext = createContext(false);
const ActionBarContext = createContext<{
  orientation: ActionBarOrientation;
  loop: boolean;
  close: () => void;
} | null>(null);
function useActionBar() {
  const context = useContext(ActionBarContext);
  if (!context)
    throw new Error("ActionBar parts must be rendered inside ActionBar.");
  return context;
}
const subscribe = () => () => {};
const getBody = () => document.body;
const getServerBody = () => null;

export const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(
  function ActionBar(
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      side = "bottom",
      sideOffset = 16,
      align = "center",
      alignOffset = 0,
      portalContainer,
      onEscapeKeyDown,
      dir,
      orientation = "horizontal",
      loop = true,
      render,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = openProp ?? internalOpen;
    const inheritedDirection = useDirection();
    const direction = dir ?? inheritedDirection;
    const body = useSyncExternalStore(subscribe, getBody, getServerBody);
    const host = portalContainer ?? body;
    const elementRef = useRef<HTMLDivElement>(null);
    const handlers = useRef({
      onOpenChange,
      onEscapeKeyDown,
      controlled: openProp !== undefined,
    });
    useEffect(() => {
      handlers.current = {
        onOpenChange,
        onEscapeKeyDown,
        controlled: openProp !== undefined,
      };
    }, [onOpenChange, onEscapeKeyDown, openProp]);
    function close() {
      if (openProp === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    }
    useEffect(() => {
      if (!open || !host) return;
      const element = elementRef.current;
      const owner = host.ownerDocument;
      if (!owner) return;
      const previous = owner.activeElement as HTMLElement | null;
      let hadFocus = false;
      const trackFocus = (event: FocusEvent) => {
        if (event.target !== owner.body)
          hadFocus = Boolean(element?.contains(event.target as Node));
      };
      const escape = (event: KeyboardEvent) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          event.isComposing
        )
          return;
        handlers.current.onEscapeKeyDown?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (!handlers.current.controlled) setInternalOpen(false);
        handlers.current.onOpenChange?.(false);
      };
      owner.addEventListener("focusin", trackFocus);
      owner.addEventListener("keydown", escape);
      return () => {
        owner.removeEventListener("focusin", trackFocus);
        owner.removeEventListener("keydown", escape);
        if (
          hadFocus &&
          previous?.isConnected &&
          (owner.activeElement === owner.body ||
            element?.contains(owner.activeElement))
        ) {
          previous.focus({ preventScroll: true });
        }
      };
    }, [open, host]);

    const position: CSSProperties = {
      [side]: `calc(${sideOffset}px + env(safe-area-inset-${side}, 0px))`,
      ...(align === "center"
        ? { left: `calc(50% + ${alignOffset}px)` }
        : {
            [align === "start" ? "insetInlineStart" : "insetInlineEnd"]:
              `calc(16px + ${alignOffset}px)`,
          }),
    };
    const element = useRender({
      defaultTagName: "div",
      render,
      ref: [elementRef, ref],
      enabled: open && Boolean(host),
      state: {
        open,
        side,
        align,
        orientation,
      },
      props: {
        ...props,
        role: "toolbar",
        "aria-label":
          props["aria-label"] ??
          (props["aria-labelledby"] ? undefined : "Selection actions"),
        "aria-orientation": orientation,
        "data-ajna-component": "action-bar",
        "data-slot": "action-bar",
        dir: direction,
        className: cn(
          "fixed z-[1000] box-border flex w-max max-w-[calc(100%-2rem)] animate-ajna-action-bar-in items-center gap-2 rounded-ajna-lg border border-solid border-ajna-border bg-ajna-popover p-2 font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-lg motion-reduce:animate-none",
          align === "center" && "-translate-x-1/2",
          orientation === "vertical" && "flex-col items-stretch",
          className,
        ),
        style: { ...position, ...style },
        children,
      },
    });
    if (!open || !host) return null;
    return createPortal(
      <DirectionProvider direction={direction}>
        <ActionBarContext.Provider value={{ orientation, loop, close }}>
          {element}
        </ActionBarContext.Provider>
      </DirectionProvider>,
      host,
    );
  },
);
ActionBar.displayName = "ActionBar";

export const ActionBarSelection = forwardRef<
  HTMLDivElement,
  ActionBarSelectionProps
>(function ActionBarSelection({ render, className, ...props }, ref) {
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      role: "status",
      "aria-atomic": true,
      ...props,
      "data-ajna-component": "action-bar-selection",
      "data-slot": "action-bar-selection",
      className: cn(
        "min-w-0 shrink-0 px-2 text-sm font-medium tabular-nums",
        className,
      ),
    },
  });
});
ActionBarSelection.displayName = "ActionBarSelection";

export const ActionBarGroup = forwardRef<HTMLDivElement, ActionBarGroupProps>(
  function ActionBarGroup({ className, onKeyDown, ...props }, ref) {
    const { orientation, loop } = useActionBar();
    const classes = cn(
      "flex min-w-0 items-center gap-1 overflow-x-auto",
      orientation === "vertical" && "flex-col items-stretch",
    );
    return (
      <GroupContext.Provider value={true}>
        <BaseToolbar.Root
          {...props}
          ref={ref}
          role="group"
          aria-orientation={undefined}
          orientation={orientation}
          loopFocus={loop}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              event.defaultPrevented ||
              event.nativeEvent.isComposing ||
              !["Home", "End"].includes(event.key)
            )
              return;
            const group = event.currentTarget;
            const activeItem = (event.target as Element).closest(
              '[data-ajna-component="action-bar-item"]',
            );
            if (
              activeItem?.closest(
                '[data-ajna-component="action-bar-group"]',
              ) !== group
            )
              return;
            const items = Array.from(
              group.querySelectorAll<HTMLElement>(
                '[data-ajna-component="action-bar-item"]',
              ),
            ).filter(
              (item) =>
                item.closest('[data-ajna-component="action-bar-group"]') ===
                  group &&
                !item.hasAttribute("disabled") &&
                (!item.hasAttribute("data-disabled") ||
                  item.hasAttribute("data-focusable")),
            );
            const target =
              event.key === "Home" ? items[0] : items[items.length - 1];
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          data-ajna-component="action-bar-group"
          data-slot="action-bar-group"
          className={
            typeof className === "function"
              ? (state) => cn(classes, className(state))
              : cn(classes, className)
          }
        />
      </GroupContext.Provider>
    );
  },
);
ActionBarGroup.displayName = "ActionBarGroup";

export const ActionBarItem = forwardRef<HTMLButtonElement, ActionBarItemProps>(
  function ActionBarItem(
    {
      variant = "ghost",
      size = "sm",
      shape = "base",
      loading = false,
      disabled,
      focusableWhenDisabled = true,
      icon,
      children,
      onClick,
      onSelect,
      className,
      ...props
    },
    ref,
  ) {
    const inGroup = useContext(GroupContext);
    const Item = inGroup ? BaseToolbar.Button : BaseButton;
    const classes = cn(
      buttonVariants({ variant, size, shape }),
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&>svg]:h-[1em] [&>svg]:w-[1em] [&>svg]:shrink-0",
    );
    return (
      <Item
        {...props}
        ref={ref}
        type="button"
        disabled={disabled || loading}
        focusableWhenDisabled={focusableWhenDisabled}
        aria-busy={loading || props["aria-busy"] || undefined}
        data-ajna-component="action-bar-item"
        data-slot="action-bar-item"
        className={
          typeof className === "function"
            ? (state: BaseButton.State) => cn(classes, className(state))
            : cn(classes, className)
        }
        onClick={(event) => {
          if (disabled || loading) return;
          onClick?.(event);
          if (!event.defaultPrevented) onSelect?.(event);
        }}
      >
        {loading ? (
          <Spinner size={14} aria-hidden="true" />
        ) : icon ? (
          <span
            data-ajna-component="action-bar-item-icon"
            className="inline-flex shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        {children}
      </Item>
    );
  },
);
ActionBarItem.displayName = "ActionBarItem";

export const ActionBarClose = forwardRef<
  HTMLButtonElement,
  ActionBarCloseProps
>(function ActionBarClose(
  { onClick, children, "aria-label": ariaLabel, ...props },
  ref,
) {
  const { close } = useActionBar();
  return (
    <Button
      {...props}
      ref={ref}
      type="button"
      variant="ghost"
      size="sm"
      shape="square"
      aria-label={ariaLabel ?? "Dismiss action bar"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
    >
      {children ?? (
        <X
          data-ajna-component="action-bar-close-icon"
          className="h-4 w-4"
          aria-hidden="true"
          focusable="false"
        />
      )}
    </Button>
  );
});
ActionBarClose.displayName = "ActionBarClose";

export const ActionBarSeparator = forwardRef<
  HTMLDivElement,
  ActionBarSeparatorProps
>(function ActionBarSeparator({ orientation, className, ...props }, ref) {
  const context = useActionBar();
  const resolved =
    orientation ??
    (context.orientation === "horizontal" ? "vertical" : "horizontal");
  const classes = cn(
    "shrink-0",
    resolved === "vertical" ? "mx-1 h-6 self-center" : "my-1 w-full",
  );
  return (
    <Separator
      {...props}
      ref={ref}
      orientation={resolved}
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ActionBarSeparator.displayName = "ActionBarSeparator";
