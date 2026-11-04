"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { Button } from "@/components/button";
import { cn } from "@/utils";

export type DialogSize = "sm" | "base" | "lg" | "xl";
export type DialogProps = ComponentPropsWithoutRef<typeof BaseDialog.Root>;
export type DialogTriggerProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Trigger
>;
export type DialogCloseProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Close
>;
export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Title
>;
export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Description
>;

export interface DialogContentProps extends ComponentPropsWithoutRef<
  typeof BaseDialog.Popup
> {
  /** Width of the panel. @default "base" */
  size?: DialogSize;
  /** Portal destination. Defaults to document.body. */
  container?: ComponentPropsWithoutRef<typeof BaseDialog.Portal>["container"];
  backdropClassName?: string;
  /** Show the built-in close button. @default true */
  showCloseButton?: boolean;
}

const sizes: Record<DialogSize, string> = {
  sm: "max-w-[18rem]",
  base: "max-w-lg",
  lg: "max-w-lg",
  xl: "max-w-3xl",
};

const contentClasses =
  "relative m-0 box-border grid min-w-0 w-full gap-4 rounded-ajna-lg border border-solid border-ajna-border bg-ajna-card p-4 font-ajna text-sm leading-normal text-ajna-card-foreground shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.08),0_8px_10px_-6px_rgb(0_0_0_/_0.08)] outline outline-2 outline-offset-[3px] outline-transparent transition-[opacity,transform] duration-150 ease-in-out data-[starting-style]:scale-[0.98] data-[ending-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";

/** Modal content, including a portal and backdrop. Place inside Dialog. */
const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      size = "base",
      container,
      backdropClassName,
      className,
      children,
      showCloseButton = true,
      ...props
    },
    ref,
  ) {
    const sizeClass = sizes[size];
    return (
      <BaseDialog.Portal container={container}>
        <DialogOverlay className={backdropClassName} />
        <BaseDialog.Viewport
          data-ajna-component="dialog-viewport"
          data-slot="dialog-viewport"
          className="fixed inset-0 z-[1001] grid place-items-center overflow-y-auto overscroll-contain p-4 sm:p-8"
        >
          <BaseDialog.Popup
            tabIndex={-1}
            {...props}
            ref={ref}
            className={
              typeof className === "function"
                ? (state) => cn(contentClasses, sizeClass, className(state))
                : cn(contentClasses, sizeClass, className)
            }
            data-ajna-component="dialog-content"
            data-slot="dialog-content"
          >
            {children}
            {showCloseButton && (
              <BaseDialog.Close
                data-slot="dialog-close"
                render={
                  <Button
                    variant="ghost"
                    shape="square"
                    aria-label="Close"
                    className="absolute right-2 top-2 h-8 w-8"
                  />
                }
              >
                <X
                  data-ajna-component="dialog-close-icon"
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </BaseDialog.Close>
            )}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        {...props}
        ref={ref}
        data-ajna-component="dialog-title"
        data-slot="dialog-title"
        className={
          typeof className === "function"
            ? (state) =>
                cn(
                  "m-0 text-base font-medium leading-none tracking-tight",
                  className(state),
                )
            : cn(
                "m-0 text-base font-medium leading-none tracking-tight",
                className,
              )
        }
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      {...props}
      ref={ref}
      data-ajna-component="dialog-description"
      data-slot="dialog-description"
      className={
        typeof className === "function"
          ? (state) =>
              cn(
                "m-0 text-sm leading-5 text-ajna-muted-foreground",
                className(state),
              )
          : cn("m-0 text-sm leading-5 text-ajna-muted-foreground", className)
      }
    />
  );
});
DialogDescription.displayName = "DialogDescription";

export type DialogPortalProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Portal
>;
export type DialogOverlayProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Backdrop
>;
export type DialogHeaderProps = ComponentPropsWithoutRef<"div">;
export interface DialogFooterProps extends ComponentPropsWithoutRef<"div"> {
  showCloseButton?: boolean;
}

const DialogPortal = BaseDialog.Portal;
const DialogTrigger = BaseDialog.Trigger;
const DialogClose = BaseDialog.Close;

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, ...props }, ref) {
    const classes =
      "fixed inset-0 z-[1000] bg-ajna-backdrop transition-opacity duration-150 ease-in-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none";
    return (
      <BaseDialog.Backdrop
        {...props}
        ref={ref}
        data-ajna-component="dialog-backdrop"
        data-slot="dialog-overlay"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="dialog-header"
        data-slot="dialog-header"
        className={cn(
          "flex flex-col gap-2 text-center sm:text-left",
          className,
        )}
      />
    );
  },
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter(
    { className, showCloseButton = false, children, ...props },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="dialog-footer"
        data-slot="dialog-footer"
        className={cn(
          "-mx-4 -mb-4 box-border flex flex-col-reverse gap-2 rounded-b-ajna-lg border-0 border-t border-solid border-ajna-border bg-ajna-muted/50 p-4 sm:flex-row sm:justify-end",
          className,
        )}
      >
        {children}
        {showCloseButton && (
          <BaseDialog.Close render={<Button variant="outline" />}>
            Close
          </BaseDialog.Close>
        )}
      </div>
    );
  },
);
DialogFooter.displayName = "DialogFooter";

export function Dialog(props: DialogProps) {
  return <BaseDialog.Root {...props} />;
}

export {
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
