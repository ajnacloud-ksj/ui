"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { ScrollArea as ScrollAreaBase } from "@base-ui/react/scroll-area";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, PanelLeft, X } from "lucide-react";
import React, {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/utils";

export type SidebarSide = "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsibleType = "icon" | "offcanvas" | "none";

const SIDEBAR_WIDTH = "16.25rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "57px";
const SIDEBAR_EASING = "cubic-bezier(0.77, 0, 0.175, 1)";
const SIDEBAR_ANIMATION_DURATION_MS = 250;
const TRANSITION_FALLBACK_GRACE_MS = 50;
const MOBILE_BREAKPOINT = 768;

function useOpenChangeComplete(
  open: boolean,
  duration: number,
  onComplete?: (open: boolean) => void,
  active = true,
) {
  const enabled = active && onComplete !== undefined;
  const callbackRef = useRef(onComplete);
  const durationRef = useRef(duration);
  const previousOpenRef = useRef(open);
  const previousActiveRef = useRef(active);
  const pendingOpenRef = useRef<boolean | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    callbackRef.current = onComplete;
    durationRef.current = duration;
  }, [onComplete, duration]);

  const complete = useCallback(() => {
    const pendingOpen = pendingOpenRef.current;
    if (pendingOpen === undefined) return;

    pendingOpenRef.current = undefined;
    clearTimeout(timeoutRef.current);
    callbackRef.current?.(pendingOpen);
  }, []);

  useEffect(() => {
    const openChanged = previousOpenRef.current !== open;
    const wasActive = previousActiveRef.current;
    previousOpenRef.current = open;
    previousActiveRef.current = active;
    if (!enabled) {
      pendingOpenRef.current = undefined;
      clearTimeout(timeoutRef.current);
      return;
    }
    if (!wasActive || !openChanged) return;

    pendingOpenRef.current = open;
    if (
      durationRef.current === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      complete();
      return;
    }
    timeoutRef.current = setTimeout(
      complete,
      durationRef.current + TRANSITION_FALLBACK_GRACE_MS,
    );
    return () => clearTimeout(timeoutRef.current);
  }, [active, complete, enabled, open]);

  return complete;
}

function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const query = `(max-width: ${breakpoint - 1}px)`;

  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type SidebarState = "expanded" | "collapsed" | "peeking";

export interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  variant: "sidebar" | "floating" | "inset";
  side: "left" | "right";
  collapsible: "icon" | "offcanvas" | "none";
  width: number;
  resizable: boolean;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  setWidth: (width: number) => void;
  isPeeking: boolean;
  peekable: boolean;
  startPeek: () => void;
  stopPeek: () => void;
  contained: boolean;
  animationDuration: number;

  /** Internal registration for itemId scroll targets. */
  registerItem: (id: string, node: HTMLElement | null) => void;

  /** Scroll only the owning sidebar viewport, without moving the document. */
  scrollToItem: (id: string, options?: SidebarScrollToItemOptions) => void;
  /**
   * Scroll a tagged nav item only when it is outside its sidebar viewport.
   * Explicit alignment controls where an offscreen item lands.
   */
  scrollItemIntoView: (
    id: string,
    options?: SidebarScrollToItemOptions,
  ) => void;
}

export type SidebarScrollAlign = "start" | "center" | "end" | "auto";

export interface SidebarScrollToItemOptions {
  /** Where the item lands in the viewport. Defaults to `"auto"`. */
  align?: SidebarScrollAlign;

  /** Reduced motion forces instant scrolling. @default "auto" */
  behavior?: "auto" | "smooth";
}

const SidebarContext = createContext<SidebarContextValue | null>(null);
const SidebarPortalContext = createContext<HTMLElement | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar.Provider");
  }
  return context;
}

export interface SidebarProviderProps {
  /** Initial open state when uncontrolled. @default true */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes (controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** Callback after the sidebar finishes its open or close transition. */
  onOpenChangeComplete?: (open: boolean) => void;
  /** Sidebar layout variant. @default "sidebar" */
  variant?: SidebarVariant;
  /** Which side the sidebar is on. @default "left" */
  side?: SidebarSide;
  collapsible?: "icon" | "offcanvas" | "none";
  /** Enable drag-to-resize on the sidebar edge. @default false */
  resizable?: boolean;
  /** Initial width in pixels when resizable. @default 256 */
  defaultWidth?: number;
  /** Minimum width in pixels when resizing. @default 200 */
  minWidth?: number;
  /** Maximum width in pixels when resizing. @default 480 */
  maxWidth?: number;
  /** Callback when width changes during resize. */
  onWidthChange?: (width: number) => void;

  /** Scope overlay positioning to a bounded provider. @default false */
  contained?: boolean;

  /** Expand the collapsed rail temporarily on hover or focus. @default false */
  peekable?: boolean;
  /**
   * Duration of sidebar expand/collapse animation in milliseconds.
   * @default 250
   */
  animationDuration?: number;

  mobileBreakpoint?: number;
  /** Content — typically `<Sidebar>` + main content. */
  children: ReactNode;
  /** Additional CSS classes for the wrapper div. */
  className?: string;
  /** Inline styles for the wrapper div. */
  style?: CSSProperties;
}

const DEFAULT_WIDTH_PX = 256;
const MIN_WIDTH_PX = 200;
const MAX_WIDTH_PX = 480;

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  onOpenChangeComplete,
  variant = "sidebar",
  side = "left",
  collapsible = "icon",
  resizable = false,
  defaultWidth = DEFAULT_WIDTH_PX,
  minWidth = MIN_WIDTH_PX,
  maxWidth = MAX_WIDTH_PX,
  onWidthChange,
  contained = false,
  peekable = false,
  animationDuration = SIDEBAR_ANIMATION_DURATION_MS,
  mobileBreakpoint,
  children,
  className,
  style,
}: SidebarProviderProps) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [_openMobile, _setOpenMobile] = useState(false);
  const [width, setWidthState] = useState(() =>
    Math.min(maxWidth, Math.max(minWidth, defaultWidth)),
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const openMobile =
    isMobile && openProp !== undefined ? openProp : _openMobile;

  const setOpenMobile = useCallback(
    (next: boolean) => {
      _setOpenMobile(next);

      if (isMobile && openProp !== undefined) {
        setOpenProp?.(next);
      }
    },
    [isMobile, openProp, setOpenProp],
  );

  const setWidth = useCallback(
    (newWidth: number) => {
      const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth));
      setWidthState(clamped);
      onWidthChange?.(clamped);
    },
    [minWidth, maxWidth, onWidthChange],
  );

  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      setOpenProp?.(next);
      _setOpen(next);
    },
    [setOpenProp, open],
  );

  const toggleSidebar = useCallback(() => {
    if (collapsible === "none") return;
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setIsPeeking(false);
      setOpen((prev: boolean) => !prev);
    }
  }, [isMobile, openMobile, setOpenMobile, setOpen, collapsible]);

  const startPeek = useCallback(() => {
    if (peekable && collapsible !== "none" && !open && !isMobile) {
      setIsPeeking(true);
    }
  }, [peekable, open, isMobile, collapsible]);

  const stopPeek = useCallback(() => {
    setIsPeeking(false);
  }, []);

  const state: SidebarState =
    collapsible === "none"
      ? "expanded"
      : isPeeking && peekable && !open && !isMobile
        ? "peeking"
        : open
          ? "expanded"
          : "collapsed";

  const sidebarWidthValue = isMobile
    ? SIDEBAR_WIDTH_MOBILE
    : resizable
      ? `${width}px`
      : SIDEBAR_WIDTH;

  const itemsRef = useRef(new Map<string, HTMLElement>());

  const registerItem = useCallback((id: string, node: HTMLElement | null) => {
    const items = itemsRef.current;
    if (node) {
      items.set(id, node);
    } else {
      items.delete(id);
    }
  }, []);

  const scrollToItem = useCallback(
    (id: string, options: SidebarScrollToItemOptions = {}) => {
      const { align = "auto", behavior = "auto" } = options;
      const target = itemsRef.current.get(id);
      if (!target) return;
      const viewport = target.closest<HTMLElement>('[data-sidebar="viewport"]');
      if (!viewport) return;

      const targetRect = target.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const viewportScaleY =
        viewport.offsetHeight > 0 && viewportRect.height > 0
          ? viewportRect.height / viewport.offsetHeight
          : 1;
      // Scrolling the owning viewport avoids moving the document or other views.
      const itemScrollOffset =
        (targetRect.top - viewportRect.top) / viewportScaleY +
        viewport.scrollTop;

      let desired: number;
      if (align === "center") {
        desired =
          itemScrollOffset - (viewport.clientHeight - target.offsetHeight) / 2;
      } else if (align === "end") {
        desired =
          itemScrollOffset - (viewport.clientHeight - target.offsetHeight);
      } else if (align === "auto") {
        const itemBottom = itemScrollOffset + target.offsetHeight;
        const viewBottom = viewport.scrollTop + viewport.clientHeight;
        if (itemScrollOffset < viewport.scrollTop) {
          desired = itemScrollOffset;
        } else if (itemBottom > viewBottom) {
          desired = itemBottom - viewport.clientHeight;
        } else {
          return;
        }
      } else {
        desired = itemScrollOffset;
      }

      const clamped = Math.max(
        0,
        Math.min(desired, viewport.scrollHeight - viewport.clientHeight),
      );
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewport.scrollTo({
        top: clamped,
        behavior: reducedMotion ? "auto" : behavior,
      });
    },
    [],
  );

  const scrollItemIntoView = useCallback(
    (id: string, options: SidebarScrollToItemOptions = {}) => {
      const target = itemsRef.current.get(id);
      if (!target) return;
      const viewport = target.closest<HTMLElement>('[data-sidebar="viewport"]');
      if (!viewport) return;

      const targetRect = target.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      if (
        targetRect.top >= viewportRect.top &&
        targetRect.bottom <= viewportRect.bottom
      ) {
        return;
      }

      scrollToItem(id, options);
    },
    [scrollToItem],
  );

  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      variant,
      side,
      collapsible,
      width,
      resizable,
      minWidth,
      maxWidth,
      isResizing,
      setIsResizing,
      setWidth,
      isPeeking,
      peekable,
      startPeek,
      stopPeek,
      contained,
      animationDuration,
      registerItem,
      scrollToItem,
      scrollItemIntoView,
    }),
    [
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      variant,
      side,
      collapsible,
      width,
      resizable,
      minWidth,
      maxWidth,
      isResizing,
      setWidth,
      isPeeking,
      peekable,
      startPeek,
      stopPeek,
      contained,
      animationDuration,
      registerItem,
      scrollToItem,
      scrollItemIntoView,
    ],
  );

  const completeDesktopOpenChange = useOpenChangeComplete(
    open,
    animationDuration,
    onOpenChangeComplete,
    !isMobile,
  );
  const completeMobileOpenChange = useOpenChangeComplete(
    openMobile,
    animationDuration,
    onOpenChangeComplete,
    isMobile,
  );
  const completeOpenChange = isMobile
    ? completeMobileOpenChange
    : completeDesktopOpenChange;
  const transitionProperty = isMobile ? "transform" : "width";
  const handleOpenTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-sidebar-wrapper]") === event.currentTarget &&
        target.dataset.sidebar === "sidebar" &&
        event.propertyName === transitionProperty
      ) {
        completeOpenChange();
      }
    },
    [completeOpenChange, transitionProperty],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <SidebarPortalContext.Provider value={portalContainer}>
        <div
          data-ajna-component="sidebar"
          ref={setPortalContainer}
          data-sidebar-wrapper=""
          data-state={state}
          data-side={side}
          onTransitionEnd={handleOpenTransitionEnd}
          style={
            {
              "--sidebar-width": sidebarWidthValue,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              "--ajna-sidebar-header-height": "3.5rem",
              "--sidebar-animation-duration": `${animationDuration}ms`,
              "--sidebar-easing": SIDEBAR_EASING,
              ...style,
            } as CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper relative isolate box-border flex w-full border-solid font-ajna text-sm leading-5 text-ajna-foreground",
            !contained && !isMobile && "min-h-svh",
            "has-[[data-variant=inset]]:bg-ajna-muted",
            isResizing && "select-none",
            className,
          )}
        >
          {children}
        </div>
      </SidebarPortalContext.Provider>
    </SidebarContext.Provider>
  );
}

SidebarProvider.displayName = "Sidebar.Provider";

export interface SidebarRootProps extends ComponentPropsWithoutRef<"aside"> {
  /** Additional CSS classes for the sidebar element. */
  className?: string;
  /** Additional CSS classes for the inner content container. */
  contentClassName?: string;
  /** Sidebar content — Header, Content, Footer, etc. */
  children: ReactNode;

  /** Use the full available width on mobile. @default false */
  fullScreenOnMobile?: boolean;
}

const SidebarRoot = forwardRef<HTMLElement, SidebarRootProps>(
  (
    {
      className,
      contentClassName,
      children,
      fullScreenOnMobile = false,
      ...props
    },
    ref,
  ) => {
    const {
      state,
      open,
      isMobile,
      openMobile,
      setOpenMobile,
      side,
      variant,
      collapsible,
      isResizing,
      isPeeking,
      startPeek,
      stopPeek,
      contained,
    } = useSidebar();

    const portalContainer = useContext(SidebarPortalContext);
    const isPointerInPeekZoneRef = useRef(false);

    const handlePeekBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        if (
          !e.currentTarget.contains(e.relatedTarget as Node) &&
          !isPointerInPeekZoneRef.current
        ) {
          stopPeek();
        }
      },
      [stopPeek],
    );

    const handlePeekMouseEnter = useCallback(() => {
      isPointerInPeekZoneRef.current = true;
      startPeek();
    }, [startPeek]);

    const handlePeekMouseLeave = useCallback(() => {
      isPointerInPeekZoneRef.current = false;
      stopPeek();
    }, [stopPeek]);

    if (collapsible === "none") {
      return (
        <aside
          data-ajna-component="sidebar"
          ref={ref}
          data-state="expanded"
          data-side={side}
          data-variant={variant}
          data-sidebar="sidebar"
          style={{
            width: "var(--sidebar-width)",
            minWidth: "var(--sidebar-width)",
            maxWidth: "var(--sidebar-width)",
          }}
          className={cn(
            "group/sidebar relative box-border flex h-full shrink-0 grow-0 flex-col overflow-hidden border-solid bg-ajna-sidebar text-ajna-sidebar-foreground",
            variant === "sidebar" &&
              (side === "left"
                ? "border-r border-ajna-sidebar-border"
                : "border-l border-ajna-sidebar-border"),
            variant === "floating" &&
              "m-2 rounded-ajna-base border border-ajna-sidebar-border shadow-lg",
            className,
          )}
          {...props}
        >
          <Tooltip.Provider>{children}</Tooltip.Provider>
        </aside>
      );
    }

    if (isMobile) {
      return (
        <BaseDrawer.Root
          open={openMobile}
          onOpenChange={setOpenMobile}
          swipeDirection={side}
        >
          <BaseDrawer.Portal
            container={portalContainer}
            data-ajna-component="sidebar"
            className="contents"
          >
            <BaseDrawer.Backdrop
              data-ajna-component="sidebar"
              data-sidebar-backdrop=""
              className={cn(
                "inset-0 z-[1000] box-border border-solid bg-ajna-backdrop opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*var(--sidebar-animation-duration))] motion-reduce:transition-none",
                contained
                  ? "absolute"
                  : "fixed min-h-[100dvh] supports-[-webkit-touch-callout:none]:absolute",
                fullScreenOnMobile && "bg-transparent",
              )}
            />
            <BaseDrawer.Viewport
              data-ajna-component="sidebar"
              data-sidebar="drawer-viewport"
              className={cn(
                "inset-0 z-[1000]",
                contained ? "absolute" : "fixed",
              )}
            >
              <BaseDrawer.Popup
                {...props}
                ref={ref as React.Ref<HTMLDivElement>}
                render={<aside />}
                aria-label={props["aria-label"] ?? "Navigation"}
                data-ajna-component="sidebar"
                data-sidebar="sidebar"
                data-state="expanded"
                data-side={side}
                data-variant={variant}
                data-collapsible={collapsible}
                data-mobile="true"
                data-swipe-axis="x"
                className={cn(
                  "group/sidebar inset-y-0 z-[1001] box-border flex flex-col overflow-hidden border-solid bg-ajna-sidebar text-ajna-sidebar-foreground outline-none transition-transform will-change-transform [transform:translate3d(var(--drawer-swipe-movement-x,0px),0,0)] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] data-[swiping]:transition-none data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*var(--sidebar-animation-duration))] motion-reduce:transition-none",
                  contained ? "absolute" : "fixed",
                  fullScreenOnMobile
                    ? "w-full"
                    : "w-[var(--sidebar-width)] max-w-full",
                  side === "left"
                    ? "left-0 data-[ending-style]:[transform:translate3d(-100%,0,0)] data-[starting-style]:[transform:translate3d(-100%,0,0)]"
                    : "right-0 data-[ending-style]:[transform:translate3d(100%,0,0)] data-[starting-style]:[transform:translate3d(100%,0,0)]",
                  !fullScreenOnMobile &&
                    (side === "left"
                      ? "border-r border-ajna-sidebar-border"
                      : "border-l border-ajna-sidebar-border"),
                  className,
                  contentClassName,
                )}
              >
                <BaseDrawer.Content
                  data-ajna-component="sidebar"
                  data-sidebar="drawer-content"
                  className="flex min-h-0 flex-1 select-text flex-col overflow-hidden overscroll-contain group-data-[swiping]/sidebar:select-none"
                >
                  <Tooltip.Provider>{children}</Tooltip.Provider>
                </BaseDrawer.Content>
              </BaseDrawer.Popup>
            </BaseDrawer.Viewport>
          </BaseDrawer.Portal>
        </BaseDrawer.Root>
      );
    }

    const collapsedWidth =
      collapsible === "icon" ? "var(--sidebar-width-icon)" : "0px";
    const expandedWidth = "var(--sidebar-width)";
    const railWidth = open ? expandedWidth : collapsedWidth;

    const contentExpanded = state !== "collapsed";
    const contentWidth = contentExpanded ? expandedWidth : collapsedWidth;

    const borderClasses =
      variant === "sidebar"
        ? side === "left"
          ? "border-r border-ajna-sidebar-border"
          : "border-l border-ajna-sidebar-border"
        : variant === "floating"
          ? "border border-ajna-sidebar-border"
          : "";

    return (
      <aside
        data-ajna-component="sidebar"
        ref={ref}
        data-state={state}
        data-side={side}
        data-variant={variant}
        data-collapsible={collapsible}
        data-sidebar="sidebar"
        style={{ width: railWidth }}
        className={cn(
          "group/sidebar relative box-border h-full shrink-0 grow-0 border-solid",
          "overflow-visible", // allow content container to overlay when peeking
          "transition-[width] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)]",
          "motion-reduce:transition-none",
          isResizing && "!transition-none",
          variant === "floating" && "m-2 rounded-ajna-base shadow-lg",
          className,
        )}
        {...props}
      >
        <Tooltip.Provider>
          {(() => {
            const childArray = React.Children.toArray(children);
            const footerChildren = childArray.filter(
              (child) =>
                React.isValidElement(child) &&
                (child.type as { displayName?: string })?.displayName ===
                  "Sidebar.Footer",
            );
            const nonFooterChildren = childArray.filter(
              (child) =>
                !React.isValidElement(child) ||
                (child.type as { displayName?: string })?.displayName !==
                  "Sidebar.Footer",
            );

            return (
              <div
                data-ajna-component="sidebar"
                data-sidebar="content-container"
                aria-hidden={
                  (!open && !isPeeking && collapsible === "offcanvas") ||
                  undefined
                }
                ref={(node) => {
                  if (node) {
                    if (!open && !isPeeking && collapsible === "offcanvas")
                      node.setAttribute("inert", "");
                    else node.removeAttribute("inert");
                  }
                }}
                style={{ width: contentWidth }}
                className={cn(
                  "box-border flex h-full flex-col border-solid",
                  "min-w-0 overflow-hidden whitespace-nowrap",
                  "bg-ajna-sidebar text-ajna-sidebar-foreground",
                  borderClasses,
                  variant === "floating" && "rounded-ajna-base",
                  "transition-[width] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)]",
                  "motion-reduce:transition-none",
                  isResizing && "!transition-none",
                  !open &&
                    cn(
                      contained ? "absolute" : "fixed",
                      "inset-y-0 z-40",
                      side === "left" && "left-0",
                      side === "right" && "right-0",
                    ),
                  open && "relative",
                  contentClassName,
                )}
              >
                <div
                  data-ajna-component="sidebar"
                  data-sidebar="peek-zone"
                  className="box-border flex min-h-0 flex-1 flex-col border-solid"
                  onMouseEnter={handlePeekMouseEnter}
                  onMouseLeave={handlePeekMouseLeave}
                  onFocus={startPeek}
                  onBlur={handlePeekBlur}
                >
                  {nonFooterChildren}
                </div>

                {footerChildren}
              </div>
            );
          })()}
        </Tooltip.Provider>
      </aside>
    );
  },
);

SidebarRoot.displayName = "Sidebar";

const SidebarHeader = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="header"
    className={cn(
      "box-border flex h-[var(--ajna-sidebar-header-height)] shrink-0 items-center gap-1 border-b border-solid border-ajna-sidebar-border",
      "overflow-hidden px-3 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0",
      className,
    )}
    {...props}
  />
));

SidebarHeader.displayName = "Sidebar.Header";

const SidebarContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollAreaBase.Root
      data-ajna-component="sidebar"
      ref={ref}
      data-sidebar="content"
      className={cn(
        "relative box-border min-h-0 min-w-0 flex-1 overflow-hidden border-solid",
        className,
      )}
      {...props}
    >
      <ScrollAreaBase.Viewport
        data-ajna-component="sidebar"
        tabIndex={-1}
        data-sidebar="viewport"
        className={cn(
          "box-border h-full border-solid px-[11px] py-3 group-[[data-state]:not([data-state=collapsed])]/sidebar:px-3.5",
          "transition-[padding] [transition-duration:var(--sidebar-animation-duration)] motion-reduce:transition-none",
          "!overflow-x-hidden",

          "[mask-image:linear-gradient(to_bottom,transparent_0,black_min(24px,var(--scroll-area-overflow-y-start,24px)),black_calc(100%-min(24px,var(--scroll-area-overflow-y-end,24px))),transparent_100%)]",
        )}
      >
        <ScrollAreaBase.Content
          data-ajna-component="sidebar"
          className="box-border flex !min-w-0 flex-col border-solid"
        >
          {children}
        </ScrollAreaBase.Content>
      </ScrollAreaBase.Viewport>
      <ScrollAreaBase.Scrollbar
        data-ajna-component="sidebar"
        orientation="vertical"
        className={cn(
          "absolute bottom-0 right-0 top-0 box-border flex w-1.5 touch-none select-none border-solid p-px",
          "opacity-0 transition-opacity duration-150 motion-reduce:transition-none",
          "data-[hovering]:opacity-100 data-[scrolling]:opacity-100",
          "group-data-[state=collapsed]/sidebar:hidden",
        )}
      >
        <ScrollAreaBase.Thumb
          data-ajna-component="sidebar"
          className="box-border flex-1 rounded-full border-solid bg-ajna-sidebar-border"
        />
      </ScrollAreaBase.Scrollbar>
    </ScrollAreaBase.Root>
  );
});

SidebarContent.displayName = "Sidebar.Content";

const SidebarFooter = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="footer"
    className={cn(
      "box-border flex h-12 w-full min-w-0 shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap border-t border-solid border-ajna-sidebar-border",
      "px-[11px] group-[[data-state]:not([data-state=collapsed])]/sidebar:px-4",
      "bg-ajna-sidebar",
      "transition-[padding] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)]",
      "motion-reduce:transition-none",
      "sticky bottom-0",
      "bg-clip-padding",
      className,
    )}
    {...props}
  />
));

SidebarFooter.displayName = "Sidebar.Footer";

/**
 * Placeholder rows for `Sidebar.Loading`, grouped like a real nav. Each string
 * is a label-width utility; each group renders a group label above its items.
 */
const SIDEBAR_LOADING_GROUPS: readonly (readonly string[])[] = [
  ["w-28", "w-40", "w-24"],
  ["w-24", "w-36", "w-32"],
];

const sidebarLoadingSkeletonClasses =
  "bg-ajna-sidebar-foreground/10 after:bg-[linear-gradient(90deg,transparent,hsl(var(--sidebar-foreground)_/_0.08),transparent)]";

const SidebarLoading = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    /** Accessible label announced to assistive tech. */
    label?: string;
  }
>(({ className, label = "Loading", ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="loading"
    role="status"
    aria-label={label}
    className={cn(
      "box-border flex min-h-0 w-full flex-1 flex-col gap-4 border-solid px-2 py-3",
      className,
    )}
    {...props}
  >
    {SIDEBAR_LOADING_GROUPS.map((widths, groupIndex) => (
      <div
        data-ajna-component="sidebar"
        key={groupIndex}
        className="box-border flex flex-col gap-0.5 border-solid"
      >
        <Skeleton
          className={cn(
            sidebarLoadingSkeletonClasses,
            "mb-1 ml-2 box-border h-2 w-16 rounded-full border-solid group-data-[state=collapsed]/sidebar:hidden",
          )}
        />
        {widths.map((width, itemIndex) => (
          <div
            data-ajna-component="sidebar"
            key={itemIndex}
            className="box-border flex min-h-[2.125rem] items-center gap-3 rounded-ajna-base border-solid px-3 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0"
          >
            <Skeleton
              className={cn(
                sidebarLoadingSkeletonClasses,
                "box-border size-[1.125rem] shrink-0 rounded-ajna-md border-solid",
              )}
            />
            <Skeleton
              className={cn(
                sidebarLoadingSkeletonClasses,
                "box-border h-2.5 rounded-full border-solid group-data-[state=collapsed]/sidebar:hidden",
                width,
              )}
            />
          </div>
        ))}
      </div>
    ))}
  </div>
));

SidebarLoading.displayName = "Sidebar.Loading";

const SidebarGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="group"
    className={cn(
      "box-border flex min-w-0 flex-col gap-y-px border-solid",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));

SidebarGroup.displayName = "Sidebar.Group";

const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      "box-border grid overflow-hidden border-solid",
      "transition-[grid-template-rows,margin,border-color] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)]",

      "group-data-[mobile=true]/sidebar:transition-none",

      "my-3 grid-rows-[0fr] border-b border-ajna-sidebar-border",

      "[[data-sidebar=group]:first-child_&]:my-0 [[data-sidebar=group]:first-child_&]:border-transparent",

      "group-[[data-state]:not([data-state=collapsed])]/sidebar:my-0 group-[[data-state]:not([data-state=collapsed])]/sidebar:grid-rows-[1fr] group-[[data-state]:not([data-state=collapsed])]/sidebar:border-transparent",

      "group-data-[mobile=true]/sidebar:my-0 group-data-[mobile=true]/sidebar:grid-rows-[1fr] group-data-[mobile=true]/sidebar:border-transparent",
      className,
    )}
    {...props}
  >
    <div
      data-ajna-component="sidebar"
      className="box-border min-h-0 min-w-0 border-solid"
    >
      <div
        data-ajna-component="sidebar"
        className={cn(
          "mb-2 mt-4 box-border truncate border-solid px-3 text-sm font-medium text-ajna-sidebar-foreground/60",

          "[[data-sidebar=group]:first-child_&]:mt-2",
        )}
      >
        {children}
      </div>
    </div>
  </div>
));

SidebarGroupLabel.displayName = "Sidebar.GroupLabel";

const MenuItemContext = createContext(false);

const MenuSubItemContext = createContext(false);

const SidebarMenu = forwardRef<
  HTMLUListElement,
  ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="menu"
    className={cn(
      "m-0 box-border flex min-w-0 list-none flex-col items-stretch gap-y-px border-solid p-0",
      className,
    )}
    {...props}
  />
));

SidebarMenu.displayName = "Sidebar.Menu";

export interface SidebarMenuItemProps extends ComponentPropsWithoutRef<"li"> {
  /** Anchor id for `useSidebar().scrollToItem(id)`. */
  itemId?: string;
}

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, children, itemId, ...props }, ref) => {
    const { registerItem } = useSidebar();
    const setRef = useCallback(
      (node: HTMLLIElement | null) => {
        if (itemId) registerItem(itemId, node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLLIElement | null>).current = node;
        }
      },
      [itemId, ref, registerItem],
    );
    return (
      <MenuItemContext.Provider value={true}>
        <li
          data-ajna-component="sidebar"
          ref={setRef}
          data-sidebar="menu-item"
          data-sidebar-item-id={itemId}
          className={cn(
            "relative box-border border-solid group-data-[state=collapsed]/sidebar:overflow-hidden",
            className,
          )}
          {...props}
        >
          {children}
        </li>
      </MenuItemContext.Provider>
    );
  },
);

SidebarMenuItem.displayName = "Sidebar.MenuItem";

export type SidebarMenuButtonSize = "base" | "sm";

export interface SidebarMenuButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children"
> {
  /** Decorative icon element from any icon library. */
  icon?: React.ReactElement;
  /** Router link or another element that forwards its props and ref. */
  render?: React.ReactElement;
  active?: boolean;

  size?: SidebarMenuButtonSize;
  href?: string;
  /** Link target — only meaningful when `href` is provided. */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  tooltip?: string;
  /** Anchor id for `useSidebar().scrollToItem(id)`. */
  itemId?: string;
  className?: string;
  children?: ReactNode;
}

const SidebarMenuButton = forwardRef<HTMLElement, SidebarMenuButtonProps>(
  (
    {
      className,
      icon,
      render,
      disabled = false,
      active = false,
      size = "base",
      href,
      target,
      tooltip,
      itemId,
      children,
      ...props
    },
    ref,
  ) => {
    const { state, side, peekable, registerItem } = useSidebar();
    const isInsideMenuItem = useContext(MenuItemContext);

    const registerAutoWrap = useCallback(
      (node: HTMLLIElement | null) => {
        if (itemId && !isInsideMenuItem) registerItem(itemId, node);
      },
      [itemId, isInsideMenuItem, registerItem],
    );

    const registerInteractive = useCallback(
      (node: HTMLElement | null) => {
        if (itemId && isInsideMenuItem) registerItem(itemId, node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [itemId, isInsideMenuItem, ref, registerItem],
    );

    const content = (
      <div
        data-ajna-component="sidebar"
        className={cn(
          "box-border flex min-w-0 flex-1 items-center gap-3 border-solid",
          icon && "group-data-[state=collapsed]/sidebar:justify-center",
        )}
      >
        {icon && (
          <span
            data-ajna-component="sidebar"
            aria-hidden="true"
            className={cn(
              "box-border inline-flex shrink-0 border-solid opacity-[0.65] [&>svg]:h-full [&>svg]:w-full",
              size === "base" ? "h-4 w-4" : "h-3.5 w-3.5",
            )}
          >
            {icon}
          </span>
        )}
        <span
          data-ajna-component="sidebar"
          className={cn(
            "box-border flex min-w-0 flex-1 items-center gap-2 overflow-hidden border-solid text-left",
            icon && "group-data-[state=collapsed]/sidebar:sr-only",
          )}
        >
          {React.Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span
                data-ajna-component="sidebar"
                className="box-border truncate border-solid"
              >
                {child}
              </span>
            ) : (
              child
            ),
          )}
        </span>
      </div>
    );

    const buttonClasses = cn(
      "group/menu-button relative flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-ajna-base outline-none",
      "before:absolute before:-inset-y-px before:inset-x-0 before:content-['']",

      size === "base" && "min-h-[2.125rem] px-3 py-0 text-sm font-medium",
      size === "sm" && "min-h-7 px-2 py-0 text-sm",
      icon && "group-data-[state=collapsed]/sidebar:px-0",
      "text-ajna-sidebar-foreground",
      "transition-[color,box-shadow,outline] [transition-duration:var(--sidebar-animation-duration)]",
      !active && "hover:bg-ajna-sidebar-accent",

      active && "bg-ajna-sidebar-accent",

      "has-[[data-active]]:bg-transparent has-[[data-active]]:hover:bg-ajna-sidebar-accent",

      "focus-visible:bg-ajna-sidebar-accent focus-visible:text-ajna-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ajna-sidebar-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none",
      "data-[active]:bg-ajna-sidebar-accent data-[active]:text-ajna-sidebar-accent-foreground",
      className,
    );

    let button = useRender({
      defaultTagName: href ? "a" : "button",
      render,
      ref: registerInteractive,
      props: {
        ...props,
        href,
        target,
        type: href ? undefined : (props.type ?? "button"),
        disabled: href ? undefined : disabled,
        "aria-disabled": disabled || undefined,
        "aria-current": active && href ? "page" : props["aria-current"],
        "aria-label":
          props["aria-label"] ??
          (typeof children === "string" ? children : tooltip),
        tabIndex: disabled ? -1 : props.tabIndex,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          props.onClick?.(event);
        },
        className: cn(
          "m-0 box-border border-0 border-solid bg-transparent font-ajna no-underline",
          buttonClasses,
        ),
        "data-active": active || undefined,
        "data-sidebar": "menu-button",
        "data-sidebar-item-id": isInsideMenuItem ? itemId : undefined,
        "data-ajna-component": "sidebar",
        "data-size": size,
        children: content,
      },
    });

    const showTooltip = state === "collapsed" && !peekable;
    if (tooltip) {
      button = (
        <Tooltip.Root disabled={!showTooltip}>
          <Tooltip.Trigger render={button as React.ReactElement} />
          <Tooltip.Content side={side === "left" ? "right" : "left"}>
            {tooltip}
          </Tooltip.Content>
        </Tooltip.Root>
      );
    }

    if (!isInsideMenuItem) {
      return (
        <li
          data-ajna-component="sidebar"
          ref={registerAutoWrap}
          data-sidebar="menu-item"
          data-sidebar-item-id={itemId}
          className="relative box-border border-solid group-data-[state=collapsed]/sidebar:overflow-hidden"
        >
          {button}
        </li>
      );
    }

    return button;
  },
);

SidebarMenuButton.displayName = "Sidebar.MenuButton";

const SidebarMenuBadge = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "box-border inline-flex shrink-0 items-center rounded-full border border-solid border-dashed border-ajna-sidebar-border",
      "select-none px-1.5 py-0.5 text-[11px] font-medium leading-none text-ajna-sidebar-accent-foreground",

      "group-data-[state=collapsed]/sidebar:hidden",
      className,
    )}
    {...props}
  />
));

SidebarMenuBadge.displayName = "Sidebar.MenuBadge";

const SidebarMenuSub = forwardRef<
  HTMLUListElement,
  ComponentPropsWithoutRef<"ul">
>(({ className, children, ...props }, ref) => (
  <ul
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "relative m-0 box-border flex min-w-0 list-none flex-col gap-y-px overflow-hidden border-solid p-0 pl-7 pr-0",
      className,
    )}
    {...props}
  >
    <li
      data-ajna-component="sidebar"
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-px left-[19px] z-10 box-border block w-px border-solid bg-ajna-sidebar-border"
    />
    {children}
  </ul>
));

SidebarMenuSub.displayName = "Sidebar.MenuSub";

const SidebarMenuSubItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<"li">
>(({ className, children, ...props }, ref) => (
  <MenuSubItemContext.Provider value={true}>
    <li
      data-ajna-component="sidebar"
      ref={ref}
      data-sidebar="menu-sub-item"
      className={cn("relative box-border border-solid", className)}
      {...props}
    >
      {children}
    </li>
  </MenuSubItemContext.Provider>
));

SidebarMenuSubItem.displayName = "Sidebar.MenuSubItem";

export interface SidebarMenuSubButtonProps extends ComponentPropsWithoutRef<"button"> {
  active?: boolean;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  render?: React.ReactElement;
}

const SidebarMenuSubButton = forwardRef<HTMLElement, SidebarMenuSubButtonProps>(
  (
    {
      className,
      active = false,
      href,
      target,
      render,
      disabled = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isInsideMenuSubItem = useContext(MenuSubItemContext);

    const buttonClasses = cn(
      "group/menu-button relative flex min-h-[2.125rem] w-full min-w-0 cursor-pointer items-center gap-2 rounded-ajna-base px-3 py-0 text-sm font-medium outline-none",
      "before:absolute before:-inset-y-px before:inset-x-0 before:content-['']",
      "text-ajna-sidebar-foreground transition-[color] duration-150",
      !active && "hover:bg-ajna-sidebar-accent",
      active && "bg-ajna-sidebar-accent",
      "focus:outline-none focus-visible:bg-ajna-sidebar-accent focus-visible:text-ajna-sidebar-accent-foreground",
      className,
    );

    const content = (
      <span
        data-ajna-component="sidebar"
        className="box-border flex min-w-0 flex-1 items-center gap-2 overflow-hidden border-solid text-left"
      >
        {React.Children.map(children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <span
              data-ajna-component="sidebar"
              className="box-border truncate border-solid"
            >
              {child}
            </span>
          ) : (
            child
          ),
        )}
      </span>
    );

    const button = useRender({
      defaultTagName: href ? "a" : "button",
      render,
      ref,
      props: {
        ...props,
        href,
        target,
        type: href ? undefined : (props.type ?? "button"),
        disabled: href ? undefined : disabled,
        "aria-disabled": disabled || undefined,
        "aria-current": active && href ? "page" : props["aria-current"],
        tabIndex: disabled ? -1 : props.tabIndex,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          props.onClick?.(event);
        },
        className: cn(
          buttonClasses,
          "m-0 border-0 bg-transparent font-ajna no-underline focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ajna-sidebar-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active]:bg-ajna-sidebar-accent data-[active]:text-ajna-sidebar-accent-foreground motion-reduce:transition-none",
        ),
        "data-active": active || undefined,
        "data-sidebar": "menu-sub-button",
        "data-ajna-component": "sidebar",
        children: content,
      },
    });

    if (!isInsideMenuSubItem) {
      return (
        <li
          data-ajna-component="sidebar"
          data-sidebar="menu-sub-item"
          className="relative box-border border-solid"
        >
          {button}
        </li>
      );
    }

    return button;
  },
);

SidebarMenuSubButton.displayName = "Sidebar.MenuSubButton";

/**
 * Horizontal divider line between sidebar sections.
 */
const SidebarSeparator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    data-ajna-component="sidebar"
    ref={ref}
    data-sidebar="separator"
    className={cn("my-3 box-border border-solid px-2", className)}
    {...props}
  >
    <div
      data-ajna-component="sidebar"
      className="box-border border-b border-solid border-ajna-sidebar-border"
    />
  </div>
));

SidebarSeparator.displayName = "Sidebar.Separator";

/**
 * Animated sidebar panel icon. The vertical divider line slides based
 * on the sidebar's open/closed state.
 */
function SidebarPanelIcon({ className }: { className?: string }) {
  const { open, openMobile, isMobile, side } = useSidebar();
  const expanded = isMobile ? openMobile : open;
  return (
    <PanelLeft
      data-ajna-component="sidebar"
      aria-hidden="true"
      size={18}
      className={cn(
        "shrink-0 [&>path]:transition-transform [&>path]:[transition-duration:var(--sidebar-animation-duration)] motion-reduce:[&>path]:transition-none",
        !expanded && "[&>path]:translate-x-[6px]",
        side === "right" && "rotate-180",
        className,
      )}
    />
  );
}

SidebarPanelIcon.displayName = "Sidebar.PanelIcon";

const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, children, onClick, ...props }, ref) => {
  const {
    open: desktopOpen,
    openMobile,
    isMobile,
    collapsible,
    toggleSidebar,
  } = useSidebar();
  const open = collapsible === "none" || (isMobile ? openMobile : desktopOpen);

  return (
    <button
      data-ajna-component="sidebar"
      ref={ref}
      type="button"
      data-sidebar="trigger"
      aria-expanded={open}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "m-0 box-border flex size-[2.125rem] shrink-0 cursor-pointer items-center justify-center rounded-ajna-base border-0 border-solid bg-transparent p-0 font-ajna",
        "text-ajna-muted-foreground hover:bg-ajna-accent hover:text-ajna-foreground group-data-[sidebar=sidebar]/sidebar:text-ajna-sidebar-foreground/60 group-data-[sidebar=sidebar]/sidebar:hover:bg-ajna-sidebar-accent group-data-[sidebar=sidebar]/sidebar:hover:text-ajna-sidebar-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ajna-ring group-data-[sidebar=sidebar]/sidebar:focus-visible:ring-ajna-sidebar-ring",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggleSidebar();
      }}
      {...props}
    >
      {children ?? <SidebarPanelIcon />}
    </button>
  );
});

SidebarTrigger.displayName = "Sidebar.Trigger";

const SidebarClose = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, ref) => {
  const { setOpenMobile } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      shape="square"
      size="sm"
      data-sidebar="close"
      aria-label="Close navigation"
      className={cn(
        "box-border shrink-0 border-solid text-ajna-sidebar-foreground focus:outline-ajna-sidebar-ring [&:hover:not(:disabled)]:bg-ajna-sidebar-accent",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpenMobile(false);
      }}
      {...props}
    >
      <X size={18} aria-hidden="true" />
    </Button>
  );
});

SidebarClose.displayName = "Sidebar.Close";

/**
 * Invisible interaction strip at the sidebar edge for click-to-toggle.
 * Renders a thin hover-sensitive area between the sidebar and main content.
 */
const SidebarRail = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;

  return (
    <button
      data-ajna-component="sidebar"
      ref={ref}
      type="button"
      data-sidebar="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      className={cn(
        "absolute inset-y-0 z-[1] m-0 box-border hidden w-4 cursor-pointer border-0 border-solid bg-transparent p-0 transition-all",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:content-['']",
        "hover:after:bg-ajna-sidebar-primary/20",
        "group-data-[side=left]/sidebar-wrapper:right-0 group-data-[side=left]/sidebar-wrapper:translate-x-1/2",
        "group-data-[side=right]/sidebar-wrapper:left-0 group-data-[side=right]/sidebar-wrapper:-translate-x-1/2",
        "motion-reduce:transition-none sm:flex",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    />
  );
});

SidebarRail.displayName = "Sidebar.Rail";

const SidebarResizeHandle = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, onPointerDown, onKeyDown, ...props }, ref) => {
  const {
    side,
    resizable,
    isMobile,
    collapsible,
    setIsResizing,
    setWidth,
    setOpen,
    open,
    minWidth,
    width: currentWidth,
    maxWidth,
  } = useSidebar();
  const startX = useRef(0);
  const startWidth = useRef(0);
  const wasCollapsed = useRef(false);

  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cleanupRef.current?.(), []);
  if (!resizable || isMobile || collapsible === "none") return null;

  const KEYBOARD_STEP = 10;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || e.button !== 0) return;
    e.preventDefault();
    cleanupRef.current?.();
    setIsResizing(true);
    startX.current = e.clientX;
    wasCollapsed.current = !open;

    const wrapper = (e.currentTarget as HTMLElement).closest(
      "[data-sidebar-wrapper]",
    );
    const sidebar = wrapper?.querySelector("[data-sidebar='sidebar']");
    startWidth.current = sidebar?.getBoundingClientRect().width ?? 0;

    const cleanup = () => {
      setIsResizing(false);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      cleanupRef.current = undefined;
    };
    cleanupRef.current = cleanup;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta =
        side === "left"
          ? moveEvent.clientX - startX.current
          : startX.current - moveEvent.clientX;
      const rawWidth = startWidth.current + delta;

      if (wasCollapsed.current) {
        if (rawWidth >= minWidth) {
          wasCollapsed.current = false;
          setOpen(true);
          setWidth(rawWidth);
        }
        return;
      }

      if (rawWidth < minWidth) {
        setOpen(false);
        wasCollapsed.current = true;
        return;
      }

      setWidth(rawWidth);
    };

    const handlePointerUp = () => {
      cleanup();
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const grow = side === "left" ? "ArrowRight" : "ArrowLeft";
    const shrink = side === "left" ? "ArrowLeft" : "ArrowRight";

    if (e.key === grow) {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setWidth(minWidth);
      } else {
        setWidth(Math.min(currentWidth + KEYBOARD_STEP, maxWidth));
      }
    } else if (e.key === shrink) {
      e.preventDefault();
      const next = currentWidth - KEYBOARD_STEP;
      if (next < minWidth) {
        setOpen(false);
      } else {
        setWidth(next);
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "End") {
      e.preventDefault();
      setOpen(true);
      setWidth(maxWidth);
    }
  };

  return (
    <button
      data-ajna-component="sidebar"
      ref={ref}
      type="button"
      aria-label="Resize sidebar"
      tabIndex={0}
      data-sidebar="resize-handle"
      className={cn(
        "absolute inset-y-0 z-[2] m-0 box-border hidden w-3 cursor-col-resize border-0 border-solid bg-transparent p-0 sm:block",
        "after:absolute after:inset-y-0 after:w-0.5 after:content-['']",
        "after:bg-transparent after:transition-colors",
        "hover:after:bg-ajna-sidebar-ring focus-visible:after:bg-ajna-sidebar-ring active:after:bg-ajna-sidebar-ring",
        "touch-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ajna-sidebar-ring",
        side === "left" && "right-0 after:right-0",
        side === "right" && "left-0 after:left-0",
        className,
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});

SidebarResizeHandle.displayName = "Sidebar.ResizeHandle";

interface SidebarCollapseContextValue {
  contentId: string;
  isOpen: boolean;
  isCollapsible: boolean;
  autoScrollOnOpen: boolean;
  toggle: () => void;
  completeOpenChange: () => void;
}

const isCollapsibleContentShown = (
  isOpen: boolean,
  { isMobile, openMobile, state, collapsible }: SidebarContextValue,
) =>
  isOpen &&
  (collapsible === "none" || (isMobile ? openMobile : state !== "collapsed"));

const SidebarCollapseContext = createContext<SidebarCollapseContextValue>({
  contentId: "",
  isOpen: true,
  isCollapsible: false,
  autoScrollOnOpen: false,
  toggle: () => {},
  completeOpenChange: () => {},
});

export interface SidebarCollapsibleProps extends ComponentPropsWithoutRef<"div"> {
  /** Initial open state (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Callback after the content finishes showing or hiding. Also fires when the
   * sidebar expands or collapses an open section, including the mobile drawer.
   */
  onOpenChangeComplete?: (open: boolean) => void;
  /** Scroll the expanded content into view after opening. @default false */
  autoScrollOnOpen?: boolean;
}

const SidebarCollapsible = forwardRef<HTMLDivElement, SidebarCollapsibleProps>(
  (
    {
      defaultOpen = false,
      open: openProp,
      onOpenChange,
      onOpenChangeComplete,
      autoScrollOnOpen = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sidebar = useSidebar();
    const { animationDuration } = sidebar;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = openProp ?? internalOpen;
    const isContentShown = isCollapsibleContentShown(isOpen, sidebar);
    const contentId = useId();
    const keyboardExpandedRef = useRef(false);

    const toggle = useCallback(() => {
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);

      keyboardExpandedRef.current = false;
    }, [isOpen, onOpenChange]);

    const completeOpenChange = useOpenChangeComplete(
      isContentShown,
      animationDuration,
      onOpenChangeComplete,
    );

    const contextValue = useMemo<SidebarCollapseContextValue>(
      () => ({
        contentId,
        isOpen,
        isCollapsible: true,
        autoScrollOnOpen,
        toggle,
        completeOpenChange,
      }),
      [contentId, isOpen, autoScrollOnOpen, toggle, completeOpenChange],
    );

    const handleFocusIn = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        if (!isOpen && (e.target as HTMLElement).matches(":focus-visible")) {
          keyboardExpandedRef.current = true;
          setInternalOpen(true);
          onOpenChange?.(true);
        }
      },
      [isOpen, onOpenChange],
    );

    const handleFocusOut = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        if (
          keyboardExpandedRef.current &&
          !e.currentTarget.contains(e.relatedTarget as Node) &&
          !e.currentTarget.querySelector("[data-active]")
        ) {
          keyboardExpandedRef.current = false;
          setInternalOpen(false);
          onOpenChange?.(false);
        }
      },
      [onOpenChange],
    );

    return (
      <SidebarCollapseContext.Provider value={contextValue}>
        <div
          data-ajna-component="sidebar"
          ref={ref}
          data-open={isOpen || undefined}
          className={cn("box-border min-w-0 border-solid", className)}
          onFocus={handleFocusIn}
          onBlur={handleFocusOut}
          {...props}
        >
          {children}
        </div>
      </SidebarCollapseContext.Provider>
    );
  },
);

SidebarCollapsible.displayName = "Sidebar.Collapsible";

export interface SidebarCollapsibleTriggerProps {
  /** Element to render as the trigger. Gets aria-expanded, aria-controls, and onClick merged. */
  render: React.ReactElement;
}

function SidebarCollapsibleTrigger({ render }: SidebarCollapsibleTriggerProps) {
  const { contentId, isOpen, toggle } = useContext(SidebarCollapseContext);

  return React.cloneElement(render, {
    "aria-expanded": isOpen,
    "aria-controls": contentId,
    "data-open": isOpen || undefined,
    onClick: (e: React.MouseEvent) => {
      const existingOnClick = (
        render.props as { onClick?: (e: React.MouseEvent) => void }
      ).onClick;
      existingOnClick?.(e);
      if (!e.defaultPrevented) toggle();
    },
  } as Record<string, unknown>);
}

SidebarCollapsibleTrigger.displayName = "Sidebar.CollapsibleTrigger";

const SidebarCollapsibleContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, onTransitionEnd, ...props }, ref) => {
  const {
    contentId,
    isOpen: isCollapsibleOpen,
    autoScrollOnOpen,
    completeOpenChange,
  } = useContext(SidebarCollapseContext);
  const sidebar = useSidebar();
  const { animationDuration } = sidebar;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const isContentShown = isCollapsibleContentShown(isCollapsibleOpen, sidebar);

  useEffect(() => {
    if (!isContentShown || !autoScrollOnOpen) return;

    const timeout = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const node = contentRef.current;
      const viewport = node?.closest<HTMLElement>('[data-sidebar="viewport"]');
      if (!node || !viewport) return;
      const contentRect = node.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const delta =
        contentRect.bottom > viewportRect.bottom
          ? Math.min(
              contentRect.bottom - viewportRect.bottom,
              contentRect.top - viewportRect.top,
            )
          : Math.min(0, contentRect.top - viewportRect.top);
      if (delta)
        viewport.scrollTo({
          top: Math.max(0, viewport.scrollTop + delta),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    }, animationDuration);

    return () => window.clearTimeout(timeout);
  }, [isContentShown, autoScrollOnOpen, animationDuration]);

  // React 18 does not reliably forward inert as a JSX attribute.
  const inertRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        if (!isContentShown) {
          node.setAttribute("inert", "");
        } else {
          node.removeAttribute("inert");
        }
      }
    },
    [isContentShown],
  );

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      inertRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref, inertRef],
  );

  const handleOpenTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      onTransitionEnd?.(event);
      if (
        event.target === event.currentTarget &&
        event.propertyName === "grid-template-rows"
      ) {
        completeOpenChange();
      }
    },
    [completeOpenChange, onTransitionEnd],
  );

  return (
    <div
      data-ajna-component="sidebar"
      ref={mergedRef}
      id={contentId}
      role="region"
      aria-hidden={!isContentShown}
      onTransitionEnd={handleOpenTransitionEnd}
      className={cn(
        "box-border grid border-solid",
        "transition-[grid-template-rows] [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)]",
        "motion-reduce:transition-none",
        isContentShown ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      {...props}
    >
      <div
        data-ajna-component="sidebar"
        className="box-border overflow-hidden border-solid"
      >
        {children}
      </div>
    </div>
  );
});

SidebarCollapsibleContent.displayName = "Sidebar.CollapsibleContent";

function SidebarMenuChevron({ className }: { className?: string }) {
  const { isOpen, isCollapsible } = useContext(SidebarCollapseContext);

  return (
    <ChevronRight
      data-ajna-component="sidebar"
      size={12}
      aria-hidden="true"
      className={cn(
        "ml-auto box-border shrink-0 border-solid opacity-40 transition-[transform,rotate,opacity] duration-200 group-hover/menu-button:opacity-100 motion-reduce:transition-none",
        isCollapsible && isOpen && "rotate-90",

        "group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
    />
  );
}

SidebarMenuChevron.displayName = "Sidebar.MenuChevron";

const SlidingViewActiveContext = createContext<string>("");

export interface SidebarSlidingViewsProps extends ComponentPropsWithoutRef<"div"> {
  /** Key of the currently active view. Must match a child `SlidingView` value. */
  activeKey: string;

  direction?: "left" | "right";
}

const SidebarSlidingViews = forwardRef<
  HTMLDivElement,
  SidebarSlidingViewsProps
>(({ activeKey, direction = "left", className, children, ...props }, ref) => {
  const childArray = React.Children.toArray(children);
  const activeIndex = childArray.findIndex(
    (child) =>
      React.isValidElement(child) &&
      (child.props as { value?: string }).value === activeKey,
  );
  const translateX =
    activeIndex > 0
      ? `${direction === "left" ? "-" : ""}${activeIndex * 100}%`
      : "0%";

  return (
    <SlidingViewActiveContext.Provider value={activeKey}>
      <div
        data-ajna-component="sidebar"
        ref={ref}
        data-sidebar="sliding-views"
        className={cn(
          "box-border flex min-h-0 max-w-[var(--sidebar-width)] flex-1 overflow-hidden border-solid",
          className,
        )}
        {...props}
      >
        <div
          data-ajna-component="sidebar"
          className={cn(
            "box-border flex min-h-0 w-full shrink-0 border-solid transition-transform [transition-duration:var(--sidebar-animation-duration)] [transition-timing-function:var(--sidebar-easing)] motion-reduce:transition-none",
            direction === "right" && "flex-row-reverse",
          )}
          style={{ transform: `translateX(${translateX})` }}
        >
          {children}
        </div>
      </div>
    </SlidingViewActiveContext.Provider>
  );
});

SidebarSlidingViews.displayName = "Sidebar.SlidingViews";

export interface SidebarSlidingViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Unique key matching this view. Must correspond to `activeKey` on `SlidingViews`. */
  value: string;
}

/**
 * Individual panel inside `SlidingViews`. Inactive views are automatically
 * marked `aria-hidden` and `inert` so they're unreachable by keyboard/screen readers.
 */
const SidebarSlidingView = forwardRef<HTMLDivElement, SidebarSlidingViewProps>(
  ({ value, className, children, ...props }, ref) => {
    const activeKey = useContext(SlidingViewActiveContext);
    const isActive = activeKey === value;

    const inertRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          if (!isActive) {
            node.setAttribute("inert", "");
          } else {
            node.removeAttribute("inert");
          }
        }
      },
      [isActive],
    );

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        inertRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref, inertRef],
    );

    return (
      <div
        data-ajna-component="sidebar"
        ref={mergedRef}
        data-sidebar="sliding-view"
        data-value={value}
        aria-hidden={!isActive}
        className={cn(
          "box-border flex min-h-0 w-full shrink-0 flex-col border-solid",
          !isActive && "pointer-events-none",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SidebarSlidingView.displayName = "Sidebar.SlidingView";

export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Loading: SidebarLoading,
  Group: SidebarGroup,
  GroupLabel: SidebarGroupLabel,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  MenuButton: SidebarMenuButton,
  MenuBadge: SidebarMenuBadge,
  MenuSub: SidebarMenuSub,
  MenuSubItem: SidebarMenuSubItem,
  MenuSubButton: SidebarMenuSubButton,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
  Close: SidebarClose,
  Rail: SidebarRail,
  ResizeHandle: SidebarResizeHandle,
  MenuChevron: SidebarMenuChevron,
  Collapsible: SidebarCollapsible,
  CollapsibleTrigger: SidebarCollapsibleTrigger,
  CollapsibleContent: SidebarCollapsibleContent,
  SlidingViews: SidebarSlidingViews,
  SlidingView: SidebarSlidingView,
});

export {
  SidebarProvider,
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarLoading,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarClose,
  SidebarRail,
  SidebarResizeHandle,
  SidebarMenuChevron,
  SidebarCollapsible,
  SidebarCollapsibleTrigger,
  SidebarCollapsibleContent,
  SidebarSlidingViews,
  SidebarSlidingView,
};
