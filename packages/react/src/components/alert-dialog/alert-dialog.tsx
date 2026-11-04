"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/button";
import { cn } from "@/utils";

export function AlertDialogRoot<Payload = unknown>(
  props: BaseAlertDialog.Root.Props<Payload>,
) {
  return <BaseAlertDialog.Root {...props} />;
}
export const AlertDialogTrigger = BaseAlertDialog.Trigger;
export const AlertDialogPortal = BaseAlertDialog.Portal;
export type AlertDialogProps<Payload = unknown> =
  BaseAlertDialog.Root.Props<Payload>;
export type AlertDialogTriggerProps<Payload = unknown> =
  BaseAlertDialog.Trigger.Props<Payload>;
export type AlertDialogPortalProps = BaseAlertDialog.Portal.Props;
export type AlertDialogOverlayProps = BaseAlertDialog.Backdrop.Props;
export type AlertDialogSize = "sm" | "base";
export interface AlertDialogContentProps extends BaseAlertDialog.Popup.Props {
  size?: AlertDialogSize;
  container?: BaseAlertDialog.Portal.Props["container"];
  keepMounted?: boolean;
  overlayClassName?: string;
}
const sizes = { sm: "max-w-xs", base: "max-w-lg" };
export const AlertDialogOverlay = forwardRef<
  HTMLDivElement,
  AlertDialogOverlayProps
>(function AlertDialogOverlay({ className, ...props }, ref) {
  const classes =
    "fixed inset-0 z-[1000] bg-ajna-backdrop transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";
  return (
    <BaseAlertDialog.Backdrop
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-overlay"
      data-slot="alert-dialog-overlay"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export const AlertDialogContent = forwardRef<
  HTMLDivElement,
  AlertDialogContentProps
>(function AlertDialogContent(
  {
    size = "base",
    container,
    keepMounted,
    overlayClassName,
    className,
    ...props
  },
  ref,
) {
  const classes = cn(
    "group/alert-dialog relative m-auto box-border grid w-full min-w-0 shrink-0 gap-4 rounded-ajna-lg border border-solid border-ajna-border bg-ajna-card p-4 font-ajna text-sm leading-5 text-ajna-card-foreground shadow-xl outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none",
    sizes[size],
  );
  return (
    <AlertDialogPortal container={container} keepMounted={keepMounted}>
      <AlertDialogOverlay className={overlayClassName} />
      <BaseAlertDialog.Viewport
        data-ajna-component="alert-dialog-viewport"
        data-slot="alert-dialog-viewport"
        className="fixed inset-0 z-[1001] grid place-items-center overflow-y-auto overscroll-contain p-4 sm:p-8"
      >
        <BaseAlertDialog.Popup
          tabIndex={-1}
          {...props}
          ref={ref}
          data-ajna-component="alert-dialog-content"
          data-slot="alert-dialog-content"
          data-size={size}
          className={
            typeof className === "function"
              ? (state) => cn(classes, className(state))
              : cn(classes, className)
          }
        />
      </BaseAlertDialog.Viewport>
    </AlertDialogPortal>
  );
});
export type AlertDialogHeaderProps = ComponentPropsWithoutRef<"div">;
export const AlertDialogHeader = forwardRef<
  HTMLDivElement,
  AlertDialogHeaderProps
>(function AlertDialogHeader({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-header"
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-1.5 text-start", className)}
    />
  );
});
export type AlertDialogFooterProps = ComponentPropsWithoutRef<"div">;
export const AlertDialogFooter = forwardRef<
  HTMLDivElement,
  AlertDialogFooterProps
>(function AlertDialogFooter({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-footer"
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-4 -mb-4 box-border flex flex-col-reverse gap-2 rounded-b-ajna-lg border-0 border-t border-solid border-ajna-border bg-ajna-muted/50 p-4 group-data-[size=sm]/alert-dialog:grid group-data-[size=sm]/alert-dialog:grid-cols-2 sm:flex-row sm:justify-end",
        className,
      )}
    />
  );
});
export type AlertDialogMediaProps = ComponentPropsWithoutRef<"div">;
export const AlertDialogMedia = forwardRef<
  HTMLDivElement,
  AlertDialogMediaProps
>(function AlertDialogMedia({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-media"
      data-slot="alert-dialog-media"
      className={cn(
        "mb-1 flex h-10 w-10 items-center justify-center rounded-ajna-base bg-ajna-muted text-ajna-foreground [&>svg]:h-5 [&>svg]:w-5",
        className,
      )}
    />
  );
});
export type AlertDialogTitleProps = BaseAlertDialog.Title.Props;
export const AlertDialogTitle = forwardRef<
  HTMLHeadingElement,
  AlertDialogTitleProps
>(function AlertDialogTitle({ className, ...props }, ref) {
  const classes = "m-0 text-base font-medium leading-none tracking-tight";
  return (
    <BaseAlertDialog.Title
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-title"
      data-slot="alert-dialog-title"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export type AlertDialogDescriptionProps = BaseAlertDialog.Description.Props;
export const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionProps
>(function AlertDialogDescription({ className, ...props }, ref) {
  const classes = "m-0 text-sm leading-5 text-ajna-muted-foreground";
  return (
    <BaseAlertDialog.Description
      {...props}
      ref={ref}
      data-ajna-component="alert-dialog-description"
      data-slot="alert-dialog-description"
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
export type AlertDialogActionProps = ButtonProps;
export const AlertDialogAction = forwardRef<
  HTMLButtonElement,
  AlertDialogActionProps
>(function AlertDialogAction({ variant = "primary", ...props }, ref) {
  return (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      data-slot="alert-dialog-action"
    />
  );
});
export interface AlertDialogCancelProps extends BaseAlertDialog.Close.Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export const AlertDialogCancel = forwardRef<
  HTMLButtonElement,
  AlertDialogCancelProps
>(function AlertDialogCancel(
  { variant = "outline", size = "base", ...props },
  ref,
) {
  return (
    <BaseAlertDialog.Close
      render={<Button variant={variant} size={size} />}
      {...props}
      ref={ref}
      data-slot="alert-dialog-cancel"
    />
  );
});
export const AlertDialog = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortal,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Media: AlertDialogMedia,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
});
