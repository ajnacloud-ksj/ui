"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from "react";

import { cn } from "@/utils";

export type DrawerProps<Payload = unknown> = BaseDrawer.Root.Props<Payload> & {
  showSwipeHandle?: boolean;
};
export type DrawerTriggerProps<Payload = unknown> =
  BaseDrawer.Trigger.Props<Payload>;
export type DrawerCloseProps = BaseDrawer.Close.Props;
export type DrawerPortalProps = BaseDrawer.Portal.Props;
export type DrawerOverlayProps = BaseDrawer.Backdrop.Props;
export type DrawerSwipeHandleProps = ComponentPropsWithoutRef<"div">;
export type DrawerHeaderProps = ComponentPropsWithoutRef<"div">;
export type DrawerFooterProps = ComponentPropsWithoutRef<"div">;
export type DrawerTitleProps = BaseDrawer.Title.Props;
export type DrawerDescriptionProps = BaseDrawer.Description.Props;
export type DrawerSnapPoint = BaseDrawer.Root.SnapPoint;
export type DrawerSwipeDirection = NonNullable<
  BaseDrawer.Root.Props["swipeDirection"]
>;
export interface DrawerContentProps extends BaseDrawer.Popup.Props {
  container?: BaseDrawer.Portal.Props["container"];
  keepMounted?: boolean;
  overlayClassName?: BaseDrawer.Backdrop.Props["className"];
  viewportClassName?: BaseDrawer.Viewport.Props["className"];
}

const DrawerContext = createContext<{
  hasSnapPoints: boolean;
  modal: NonNullable<BaseDrawer.Root.Props["modal"]>;
  showSwipeHandle: boolean;
  swipeDirection: DrawerSwipeDirection;
} | null>(null);
function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("Drawer parts must be rendered inside Drawer.");
  return context;
}

export function Drawer<Payload = unknown>({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "down",
  ...props
}: DrawerProps<Payload>) {
  const hasSnapPoints = Boolean(snapPoints?.length);
  const context = useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection],
  );
  return (
    <DrawerContext.Provider value={context}>
      <BaseDrawer.Root
        {...props}
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
      />
    </DrawerContext.Provider>
  );
}

export const DrawerTrigger = BaseDrawer.Trigger;
export const DrawerClose = BaseDrawer.Close;
export const DrawerPortal = BaseDrawer.Portal;

const overlayClasses =
  "fixed inset-0 z-[1000] min-h-[100dvh] select-none bg-ajna-backdrop transition-opacity [transition-duration:450ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:[transition-duration:0ms] supports-[-webkit-touch-callout:none]:absolute motion-reduce:transition-none";
export const DrawerOverlay = forwardRef<HTMLDivElement, DrawerOverlayProps>(
  function DrawerOverlay({ className, ...props }, ref) {
    const { hasSnapPoints } = useDrawer();
    const classes = cn(
      overlayClasses,
      hasSnapPoints
        ? "opacity-[max(var(--ajna-drawer-overlay-min-opacity,0.5),calc(1-var(--drawer-swipe-progress,0)))]"
        : "opacity-[max(var(--ajna-drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress,0)))]",
    );
    return (
      <BaseDrawer.Backdrop
        {...props}
        ref={ref}
        data-ajna-component="drawer-overlay"
        data-slot="drawer-overlay"
        data-snap-points={hasSnapPoints ? "" : undefined}
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DrawerOverlay.displayName = "DrawerOverlay";

export const DrawerSwipeHandle = forwardRef<
  HTMLDivElement,
  DrawerSwipeHandleProps
>(function DrawerSwipeHandle({ className, ...props }, ref) {
  const { swipeDirection } = useDrawer();
  const vertical = swipeDirection === "down" || swipeDirection === "up";
  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="drawer-swipe-handle"
      data-slot="drawer-swipe-handle"
      className={cn(
        "relative z-10 flex shrink-0 cursor-grab touch-none items-center justify-center transition-opacity duration-200 after:rounded-full after:bg-ajna-muted-foreground/30 after:content-[''] active:cursor-grabbing group-data-[nested-drawer-open]/ajna-drawer:opacity-0 group-data-[nested-drawer-swiping]/ajna-drawer:opacity-100 motion-reduce:transition-none",
        vertical
          ? "h-8 w-full after:h-1 after:w-12"
          : "w-8 self-stretch after:h-12 after:w-1",
        (swipeDirection === "up" || swipeDirection === "left") && "order-last",
        className,
      )}
    />
  );
});
DrawerSwipeHandle.displayName = "DrawerSwipeHandle";

const popupClasses = cn(
  "group/ajna-drawer pointer-events-auto fixed z-[1001] m-[var(--ajna-drawer-inset,0px)] box-border flex h-[var(--ajna-drawer-content-height)] max-h-[var(--ajna-drawer-content-max-height,none)] min-h-0 w-[var(--ajna-drawer-content-width,auto)] select-none flex-col rounded-ajna-lg border border-solid border-ajna-border bg-ajna-card font-ajna text-sm leading-5 text-ajna-card-foreground shadow-lg outline-none transition-transform will-change-transform [transform:translate3d(var(--drawer-swipe-movement-x,0px),calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)),0)] [transition-duration:450ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ajna-ring data-[nested-drawer-open]:transition-[transform,height,filter] data-[nested-drawer-open]:[transform:translate3d(var(--ajna-drawer-translate-x),var(--ajna-drawer-translate-y),0)_scale(var(--ajna-drawer-stack-scale))]",
  "[--ajna-drawer-content-height:var(--drawer-height,auto)] [--ajna-drawer-translate-x:0px] [--ajna-drawer-translate-y:0px] data-[swipe-axis=y]:data-[snap-points]:[--ajna-drawer-content-height:100dvh] data-[swipe-axis=y]:[--ajna-drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=x]:[--ajna-drawer-content-width:75%] data-[swipe-axis=x]:sm:[--ajna-drawer-content-width:24rem]",
  "[--ajna-drawer-bleed:3rem] [--ajna-drawer-peek:1rem] [--ajna-drawer-stack-step:0.05] data-[nested-drawer-open]:[--ajna-drawer-stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] data-[nested-drawer-open]:[--ajna-drawer-stack-peek-offset:max(0px,calc((var(--nested-drawers,0)-var(--ajna-drawer-stack-progress))*var(--ajna-drawer-peek)))] data-[nested-drawer-open]:[--ajna-drawer-stack-progress:clamp(0,var(--drawer-swipe-progress,0),1)] data-[nested-drawer-open]:[--ajna-drawer-stack-scale-base:max(0,calc(1-(var(--nested-drawers,0)*var(--ajna-drawer-stack-step))))] data-[nested-drawer-open]:[--ajna-drawer-stack-scale:clamp(0,calc(var(--ajna-drawer-stack-scale-base)+(var(--ajna-drawer-stack-step)*var(--ajna-drawer-stack-progress))),1)] data-[nested-drawer-open]:[--ajna-drawer-stack-shrink:calc(1-var(--ajna-drawer-stack-scale))]",
  "after:pointer-events-none after:absolute after:bg-[var(--ajna-drawer-bleed-background,hsl(var(--ajna-card)))] after:content-[''] data-[nested-drawer-open]:overflow-hidden data-[nested-drawer-open]:brightness-95 data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=y]:after:inset-x-0 data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full data-[swipe-axis=y]:after:h-[var(--ajna-drawer-bleed)] data-[swipe-axis=x]:after:w-[var(--ajna-drawer-bleed)]",
  "data-[ending-style]:[transform:var(--ajna-drawer-closed-transform)] data-[ending-style]:data-[nested-drawer-open]:[transform:var(--ajna-drawer-closed-transform)] data-[starting-style]:[transform:var(--ajna-drawer-closed-transform)] data-[nested-drawer-swiping]:[transition-duration:0ms] data-[swiping]:[transition-duration:0ms] data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)] data-[ending-style]:data-[nested-drawer-swiping]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)] data-[ending-style]:data-[swiping]:[transition-duration:calc(var(--drawer-swipe-strength,1)*400ms)] motion-reduce:transition-none",
  "data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-[nested-drawer-open]:h-[var(--ajna-drawer-stack-height)] data-[swipe-axis=x]:flex-row",
  "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:rounded-b-none data-[swipe-direction=down]:[--ajna-drawer-closed-transform:translate3d(0,calc(100%+var(--ajna-drawer-inset,0px)+2px),0)] data-[nested-drawer-open]:data-[swipe-direction=down]:[--ajna-drawer-translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)-var(--ajna-drawer-stack-peek-offset)-(var(--ajna-drawer-stack-shrink)*var(--ajna-drawer-stack-height)))]",
  "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:rounded-t-none data-[swipe-direction=up]:[--ajna-drawer-closed-transform:translate3d(0,calc(-100%-var(--ajna-drawer-inset,0px)-2px),0)] data-[nested-drawer-open]:data-[swipe-direction=up]:[--ajna-drawer-translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)+var(--ajna-drawer-stack-peek-offset)+(var(--ajna-drawer-stack-shrink)*var(--ajna-drawer-stack-height)))]",
  "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:rounded-l-none data-[swipe-direction=left]:[--ajna-drawer-closed-transform:translate3d(calc(-100%-var(--ajna-drawer-inset,0px)-2px),0,0)] data-[nested-drawer-open]:data-[swipe-direction=left]:[--ajna-drawer-translate-x:calc(var(--drawer-swipe-movement-x,0px)+var(--ajna-drawer-stack-peek-offset)+(var(--ajna-drawer-stack-shrink)*100%))]",
  "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:rounded-r-none data-[swipe-direction=right]:[--ajna-drawer-closed-transform:translate3d(calc(100%+var(--ajna-drawer-inset,0px)+2px),0,0)] data-[nested-drawer-open]:data-[swipe-direction=right]:[--ajna-drawer-translate-x:calc(var(--drawer-swipe-movement-x,0px)-var(--ajna-drawer-stack-peek-offset)-(var(--ajna-drawer-stack-shrink)*100%))]",
);
const bodyClasses =
  "flex min-h-0 flex-1 select-text flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-out group-data-[nested-drawer-open]/ajna-drawer:opacity-0 group-data-[nested-drawer-swiping]/ajna-drawer:opacity-100 group-data-[swiping]/ajna-drawer:select-none motion-reduce:transition-none";

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(
    {
      container,
      keepMounted,
      overlayClassName,
      viewportClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { modal, hasSnapPoints, showSwipeHandle, swipeDirection } =
      useDrawer();
    const viewportClasses = cn(
      "pointer-events-none fixed inset-0 z-[1000] select-none",
      modal === true && "pointer-events-auto",
    );
    return (
      <DrawerPortal container={container} keepMounted={keepMounted}>
        {modal === true && <DrawerOverlay className={overlayClassName} />}
        <BaseDrawer.Viewport
          data-ajna-component="drawer-viewport"
          data-slot="drawer-viewport"
          className={
            typeof viewportClassName === "function"
              ? (state) => cn(viewportClasses, viewportClassName(state))
              : cn(viewportClasses, viewportClassName)
          }
        >
          <BaseDrawer.Popup
            tabIndex={-1}
            {...props}
            ref={ref}
            data-ajna-component="drawer-popup"
            data-slot="drawer-popup"
            data-swipe-axis={
              swipeDirection === "down" || swipeDirection === "up" ? "y" : "x"
            }
            data-snap-points={hasSnapPoints ? "" : undefined}
            className={
              typeof className === "function"
                ? (state) => cn(popupClasses, className(state))
                : cn(popupClasses, className)
            }
          >
            {showSwipeHandle && <DrawerSwipeHandle />}
            <BaseDrawer.Content
              data-ajna-component="drawer-content"
              data-slot="drawer-content"
              className={bodyClasses}
            >
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  function DrawerHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="drawer-header"
        data-slot="drawer-header"
        className={cn(
          "flex shrink-0 flex-col gap-1.5 p-4 group-data-[swipe-axis=y]/ajna-drawer:text-center",
          className,
        )}
      />
    );
  },
);
DrawerHeader.displayName = "DrawerHeader";
export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  function DrawerFooter({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="drawer-footer"
        data-slot="drawer-footer"
        className={cn("mt-auto flex shrink-0 flex-col gap-2 p-4", className)}
      />
    );
  },
);
DrawerFooter.displayName = "DrawerFooter";
export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  function DrawerTitle({ className, ...props }, ref) {
    const classes =
      "m-0 font-ajna text-lg font-semibold leading-6 tracking-tight";
    return (
      <BaseDrawer.Title
        {...props}
        ref={ref}
        data-ajna-component="drawer-title"
        data-slot="drawer-title"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DrawerTitle.displayName = "DrawerTitle";
export const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(function DrawerDescription({ className, ...props }, ref) {
  const classes = "m-0 text-sm leading-6 text-ajna-muted-foreground";
  return (
    <BaseDrawer.Description
      {...props}
      ref={ref}
      data-ajna-component="drawer-description"
      data-slot="drawer-description"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
DrawerDescription.displayName = "DrawerDescription";
