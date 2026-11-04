"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import { CircleCheck, Info, OctagonX, TriangleAlert, X } from "lucide-react";
import { createContext, forwardRef, useContext } from "react";

import { Button } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";

export interface ToastProviderProps extends BaseToast.Provider.Props {
  /** Tint status notifications with their semantic colors. @default false */
  richColors?: boolean;
}
export type ToasterProps = ToastProviderProps;
export type ToastPortalProps = Omit<BaseToast.Portal.Props, "ref">;
export type ToastViewportProps = Omit<BaseToast.Viewport.Props, "ref">;
export interface ToastProps extends Omit<BaseToast.Root.Props, "ref"> {
  /** Override the provider color mode for this notification. */
  richColors?: boolean;
}
export type ToastContentProps = Omit<BaseToast.Content.Props, "ref">;
export type ToastTitleProps = Omit<BaseToast.Title.Props, "ref">;
export type ToastDescriptionProps = Omit<BaseToast.Description.Props, "ref">;
export type ToastActionProps = Omit<BaseToast.Action.Props, "ref">;
export type ToastCloseProps = Omit<BaseToast.Close.Props, "ref">;

export const createToastManager = BaseToast.createToastManager;
export const useToastManager = BaseToast.useToastManager;
export const toast = createToastManager();
const RichColorsContext = createContext(false);
export function ToastProvider({
  richColors = false,
  children,
  ...props
}: ToastProviderProps) {
  return (
    <RichColorsContext.Provider value={richColors}>
      <BaseToast.Provider {...props}>{children}</BaseToast.Provider>
    </RichColorsContext.Provider>
  );
}

const statusColors = new Map([
  [
    "success",
    {
      icon: "text-ajna-success",
      rich: "[--ajna-toast-status:var(--ajna-success)] border-ajna-success/25 bg-ajna-success-tint text-ajna-success",
    },
  ],
  [
    "info",
    {
      icon: "text-ajna-info",
      rich: "[--ajna-toast-status:var(--ajna-info)] border-ajna-info/25 bg-ajna-info-tint text-ajna-info",
    },
  ],
  [
    "warning",
    {
      icon: "text-ajna-warning",
      rich: "[--ajna-toast-status:var(--ajna-warning)] border-ajna-warning/25 bg-ajna-warning-tint text-ajna-warning",
    },
  ],
  [
    "error",
    {
      icon: "text-ajna-destructive-text",
      rich: "[--ajna-toast-status:var(--ajna-destructive-text)] border-ajna-destructive-text/25 bg-ajna-destructive-tint text-ajna-destructive-text",
    },
  ],
]);

export const ToastPortal = forwardRef<HTMLDivElement, ToastPortalProps>(
  function ToastPortal(props, ref) {
    return (
      <BaseToast.Portal
        {...props}
        ref={ref}
        data-ajna-component="toast-portal"
        data-slot="toast-portal"
      />
    );
  },
);
ToastPortal.displayName = "ToastPortal";

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport({ className, ...props }, ref) {
    const classes =
      "pointer-events-none fixed inset-x-4 bottom-4 isolate z-[1200] mx-auto box-border w-auto max-w-sm font-ajna outline-none sm:left-auto sm:right-4 sm:mx-0 sm:w-full";
    return (
      <BaseToast.Viewport
        {...props}
        ref={ref}
        data-ajna-component="toast-viewport"
        data-slot="toast-viewport"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ToastViewport.displayName = "ToastViewport";

const toastClasses = cn(
  "group/toast pointer-events-auto absolute bottom-0 right-0 z-[calc(1000-var(--toast-index))] m-0 box-border w-full origin-bottom select-none rounded-ajna-lg border border-solid border-ajna-border bg-ajna-popover font-ajna text-sm leading-5 text-ajna-popover-foreground shadow-lg outline-none will-change-transform focus-visible:border-ajna-ring focus-visible:ring-[3px] focus-visible:ring-ajna-ring/50",
  "[--ajna-toast-gap:0.75rem] [--ajna-toast-height:var(--toast-frontmost-height,var(--toast-height))] [--ajna-toast-offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--ajna-toast-gap)*-1)+var(--toast-swipe-movement-y))] [--ajna-toast-peek:0.75rem] [--ajna-toast-scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--ajna-toast-shrink:calc(1-var(--ajna-toast-scale))]",
  "h-[var(--ajna-toast-height)] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--ajna-toast-peek))-(var(--ajna-toast-shrink)*var(--ajna-toast-height))))_scale(var(--ajna-toast-scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
  "after:absolute after:left-0 after:top-full after:h-[calc(var(--ajna-toast-gap)+1px)] after:w-full after:content-['']",
  "data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--ajna-toast-offset-y))]",
  "data-[limited]:pointer-events-none data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--ajna-toast-offset-y))]",
  "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--ajna-toast-offset-y))]",
  "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--ajna-toast-offset-y))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--ajna-toast-offset-y))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] motion-reduce:transition-none",
);

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { className, richColors, ...props },
  ref,
) {
  const inheritedRichColors = useContext(RichColorsContext);
  const status = statusColors.get(props.toast.type ?? "");
  const rich = (richColors ?? inheritedRichColors) && !!status;
  return (
    <BaseToast.Root
      {...props}
      ref={ref}
      data-ajna-component="toast"
      data-slot="toast"
      data-rich-colors={rich ? "true" : "false"}
      className={
        typeof className === "function"
          ? (state) => cn(toastClasses, rich && status?.rich, className(state))
          : cn(toastClasses, rich && status?.rich, className)
      }
    />
  );
});
Toast.displayName = "Toast";

export const ToastContent = forwardRef<HTMLDivElement, ToastContentProps>(
  function ToastContent({ className, ...props }, ref) {
    const classes =
      "box-border flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[behind]:opacity-0 data-[expanded]:opacity-100 motion-reduce:transition-none";
    return (
      <BaseToast.Content
        {...props}
        ref={ref}
        data-ajna-component="toast-content"
        data-slot="toast-content"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ToastContent.displayName = "ToastContent";

export const ToastTitle = forwardRef<HTMLHeadingElement, ToastTitleProps>(
  function ToastTitle({ className, ...props }, ref) {
    const classes =
      "m-0 box-border font-ajna text-sm font-medium leading-5 text-inherit";
    return (
      <BaseToast.Title
        {...props}
        ref={ref}
        data-ajna-component="toast-title"
        data-slot="toast-title"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  HTMLParagraphElement,
  ToastDescriptionProps
>(function ToastDescription({ className, ...props }, ref) {
  const classes =
    "m-0 box-border text-sm font-normal leading-5 text-ajna-muted-foreground group-data-[rich-colors=true]/toast:text-inherit";
  return (
    <BaseToast.Description
      {...props}
      ref={ref}
      data-ajna-component="toast-description"
      data-slot="toast-description"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
ToastDescription.displayName = "ToastDescription";

export const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>(
  function ToastAction(
    { className, render = <Button variant="outline" size="sm" />, ...props },
    ref,
  ) {
    const classes =
      "shrink-0 group-data-[rich-colors=true]/toast:border-[hsl(var(--ajna-toast-status)/0.25)] group-data-[rich-colors=true]/toast:text-inherit group-data-[rich-colors=true]/toast:[&:hover:not(:disabled)]:bg-[hsl(var(--ajna-toast-status)/0.1)]";
    return (
      <BaseToast.Action
        {...props}
        ref={ref}
        render={render}
        data-ajna-component="toast-action"
        data-slot="toast-action"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
ToastAction.displayName = "ToastAction";

export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  function ToastClose(
    {
      className,
      children,
      "aria-label": label = "Close toast",
      render = (
        <Button variant="ghost" size="sm" shape="square" aria-label={label} />
      ),
      ...props
    },
    ref,
  ) {
    const classes =
      "relative shrink-0 text-ajna-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-ajna-foreground group-data-[rich-colors=true]/toast:text-inherit group-data-[rich-colors=true]/toast:hover:text-inherit group-data-[rich-colors=true]/toast:[&:hover:not(:disabled)]:bg-[hsl(var(--ajna-toast-status)/0.1)] [&>svg]:h-4 [&>svg]:w-4";
    return (
      <BaseToast.Close
        {...props}
        ref={ref}
        render={render}
        aria-label={label}
        data-ajna-component="toast-close"
        data-slot="toast-close"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      >
        {children ?? <X aria-hidden="true" focusable="false" />}
      </BaseToast.Close>
    );
  },
);
ToastClose.displayName = "ToastClose";

function ToastIcon({ type }: { type: string | undefined }) {
  const Icon =
    type === "success"
      ? CircleCheck
      : type === "info"
        ? Info
        : type === "warning"
          ? TriangleAlert
          : type === "error"
            ? OctagonX
            : null;
  if (type !== "loading" && !Icon) return null;
  return (
    <span
      data-ajna-component="toast-icon"
      data-slot="toast-icon"
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center [&>svg]:pointer-events-none [&>svg]:h-4 [&>svg]:w-4",
        statusColors.get(type ?? "")?.icon,
      )}
    >
      {type === "loading" ? (
        <Spinner size="sm" aria-hidden="true" />
      ) : (
        Icon && <Icon aria-hidden="true" focusable="false" />
      )}
    </span>
  );
}

function ToastList() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />
        <div
          data-ajna-component="toast-message"
          className="flex min-w-0 flex-1 flex-col gap-1 [overflow-wrap:anywhere]"
        >
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

export function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToasterProps) {
  return (
    <ToastProvider {...props} toastManager={toastManager}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
