"use client";

import { cva } from "class-variance-authority";
import { CircleHelp } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useId,
} from "react";

import { Popover } from "@/components/popover";
import { cn } from "@/utils";

export type FieldOrientation = "vertical" | "horizontal";
export interface FieldProps extends ComponentPropsWithoutRef<"div"> {
  /** Arrangement of the control and its label. @default "vertical" */
  orientation?: FieldOrientation;
}
export type FieldSetProps = ComponentPropsWithoutRef<"fieldset">;
export interface FieldLegendProps extends ComponentPropsWithoutRef<"legend"> {
  /** Visual size of the legend. @default "legend" */
  variant?: "legend" | "label";
}
export type FieldGroupProps = ComponentPropsWithoutRef<"div">;
export type FieldContentProps = ComponentPropsWithoutRef<"div">;
export interface FieldLabelProps extends ComponentPropsWithoutRef<"label"> {
  /** Displays an asterisk; the control owns its required semantics. */
  required?: boolean;
  contextualHelp?: ReactNode;
  /** Overrides the help button's accessible name. */
  contextualHelpLabel?: string;
}
export type FieldTitleProps = ComponentPropsWithoutRef<"div">;
export type FieldDescriptionProps = ComponentPropsWithoutRef<"p">;
export type FieldSeparatorProps = ComponentPropsWithoutRef<"div">;
export interface FieldErrorProps extends ComponentPropsWithoutRef<"div"> {
  /** Duplicate messages are shown once. Children take precedence. */
  errors?: Array<{ message?: string } | undefined>;
}

const orientations = {
  vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
  horizontal:
    "flex-row items-center has-[>[data-ajna-component=field-content]]:items-start [&>[data-slot=field-label]]:flex-auto has-[>[data-ajna-component=field-content]]:[&>[role=checkbox]]:mt-px has-[>[data-ajna-component=field-content]]:[&>[role=radio]]:mt-px",
};
const fieldStyles = cva(
  "group/ajna-field box-border flex w-full min-w-0 gap-2 font-ajna text-ajna-foreground data-[invalid=true]:text-ajna-destructive-text",
  {
    variants: { orientation: orientations },
    defaultVariants: { orientation: "vertical" },
  },
);

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { className, orientation = "vertical", ...props },
  ref,
) {
  return (
    <div
      role="group"
      {...props}
      ref={ref}
      data-ajna-component="field"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldStyles({ orientation }), className)}
    />
  );
});
Field.displayName = "Field";

export const FieldSet = forwardRef<HTMLFieldSetElement, FieldSetProps>(
  function FieldSet({ className, ...props }, ref) {
    return (
      <fieldset
        {...props}
        ref={ref}
        data-ajna-component="field-set"
        data-slot="field-set"
        className={cn(
          "m-0 box-border flex min-w-0 flex-col gap-4 border-0 p-0 font-ajna text-ajna-foreground",
          className,
        )}
      />
    );
  },
);
FieldSet.displayName = "FieldSet";

export const FieldLegend = forwardRef<HTMLLegendElement, FieldLegendProps>(
  function FieldLegend({ className, variant = "legend", ...props }, ref) {
    return (
      <legend
        {...props}
        ref={ref}
        data-ajna-component="field-legend"
        data-slot="field-legend"
        data-variant={variant}
        className={cn(
          "mb-1.5 box-border p-0 font-ajna font-medium leading-snug text-ajna-foreground",
          variant === "label" ? "text-sm" : "text-base",
          className,
        )}
      />
    );
  },
);
FieldLegend.displayName = "FieldLegend";

export const FieldGroup = forwardRef<HTMLDivElement, FieldGroupProps>(
  function FieldGroup({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="field-group"
        data-slot="field-group"
        className={cn(
          "box-border flex w-full min-w-0 flex-col gap-5 [&>[data-ajna-component=field-group]]:gap-4",
          className,
        )}
      />
    );
  },
);
FieldGroup.displayName = "FieldGroup";

export const FieldContent = forwardRef<HTMLDivElement, FieldContentProps>(
  function FieldContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="field-content"
        data-slot="field-content"
        className={cn(
          "box-border flex min-w-0 flex-1 flex-col gap-0.5 leading-snug",
          className,
        )}
      />
    );
  },
);
FieldContent.displayName = "FieldContent";

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel(
    {
      className,
      htmlFor,
      children,
      id,
      required = false,
      contextualHelp,
      contextualHelpLabel,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const hasHelp = Boolean(contextualHelp);
    const labelId = id ?? `${generatedId}-label`;
    const helpLabelId = `${generatedId}-help-label`;
    const label = (
      <label
        {...props}
        id={hasHelp ? labelId : id}
        htmlFor={htmlFor}
        ref={ref}
        data-ajna-component="field-label"
        data-slot="field-label"
        className={cn(
          "box-border flex w-fit items-center gap-2 font-ajna text-sm font-medium leading-snug has-[>[data-ajna-component=field]]:w-full has-[>[data-ajna-component=field]]:flex-col has-[>[data-ajna-component=field]]:rounded-ajna-base has-[>[data-ajna-component=field]]:border has-[>[data-ajna-component=field]]:border-solid has-[:checked]:border-ajna-primary/30 has-[>[data-ajna-component=field]]:border-ajna-border has-[:checked]:bg-ajna-primary/5 has-[>[data-ajna-component=field]]:has-[:focus-visible]:ring-[3px] has-[>[data-ajna-component=field]]:has-[:focus-visible]:ring-ajna-ring/50 group-data-[disabled=true]/ajna-field:opacity-50 [&>[data-ajna-component=field]]:p-3",
          className,
        )}
      >
        {children}
        {required && (
          <span
            aria-hidden="true"
            data-ajna-component="field-required-indicator"
            data-slot="field-required-indicator"
            className="-ms-1 shrink-0 text-ajna-destructive-text"
          >
            *
          </span>
        )}
      </label>
    );
    if (!hasHelp) return label;
    return (
      <div
        data-ajna-component="field-label-container"
        data-slot="field-label"
        className="box-border flex min-w-0 items-center gap-1.5"
      >
        {label}
        <Popover.Root>
          <Popover.Trigger
            type="button"
            aria-label={contextualHelpLabel}
            aria-labelledby={
              contextualHelpLabel ? undefined : `${labelId} ${helpLabelId}`
            }
            data-ajna-component="field-contextual-help-trigger"
            data-slot="field-contextual-help-trigger"
            className="m-0 box-border inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-ajna-sm border-0 bg-transparent p-0 text-ajna-muted-foreground outline-none hover:bg-ajna-accent hover:text-ajna-foreground focus-visible:ring-2 focus-visible:ring-ajna-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <CircleHelp size={14} aria-hidden="true" />
            <span
              id={helpLabelId}
              data-ajna-component="field-contextual-help-label"
              className="sr-only"
            >
              More information
            </span>
          </Popover.Trigger>
          <Popover.Content
            align="start"
            sideOffset={4}
            aria-labelledby={labelId}
            className="gap-2"
          >
            {contextualHelp}
          </Popover.Content>
        </Popover.Root>
      </div>
    );
  },
);
FieldLabel.displayName = "FieldLabel";

export const FieldTitle = forwardRef<HTMLDivElement, FieldTitleProps>(
  function FieldTitle({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="field-title"
        data-slot="field-label"
        className={cn(
          "box-border flex w-fit items-center gap-2 font-ajna text-sm font-medium leading-snug group-data-[disabled=true]/ajna-field:opacity-50",
          className,
        )}
      />
    );
  },
);
FieldTitle.displayName = "FieldTitle";

export const FieldDescription = forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(function FieldDescription({ className, ...props }, ref) {
  return (
    <p
      {...props}
      ref={ref}
      data-ajna-component="field-description"
      data-slot="field-description"
      className={cn(
        "m-0 text-left font-ajna text-sm font-normal leading-normal text-ajna-muted-foreground [&>a:hover]:text-ajna-primary [&>a]:text-inherit [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

export const FieldSeparator = forwardRef<HTMLDivElement, FieldSeparatorProps>(
  function FieldSeparator({ className, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="field-separator"
        data-slot="field-separator"
        data-content={!!children}
        className={cn(
          "relative -my-2 box-border flex h-5 items-center font-ajna text-sm",
          className,
        )}
      >
        <span
          aria-hidden="true"
          data-ajna-component="field-separator-line"
          className="absolute inset-x-0 top-1/2 h-px bg-ajna-border"
        />
        {children && (
          <span
            data-ajna-component="field-separator-content"
            className="relative mx-auto block w-fit bg-ajna-background px-2 text-ajna-muted-foreground"
          >
            {children}
          </span>
        )}
      </div>
    );
  },
);
FieldSeparator.displayName = "FieldSeparator";

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(
  function FieldError({ className, children, errors, ...props }, ref) {
    const messages = [
      ...new Set(
        errors
          ?.map((error) => error?.message)
          .filter((message): message is string => !!message),
      ),
    ];
    const content =
      children ??
      (messages.length === 1 ? (
        messages[0]
      ) : messages.length > 1 ? (
        <ul
          data-ajna-component="field-error-list"
          className="m-0 ml-4 flex list-disc flex-col gap-1 p-0"
        >
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null);
    if (!content) return null;
    return (
      <div
        role="alert"
        {...props}
        ref={ref}
        data-ajna-component="field-error"
        data-slot="field-error"
        className={cn(
          "font-ajna text-sm font-normal leading-normal text-ajna-destructive-text",
          className,
        )}
      >
        {content}
      </div>
    );
  },
);
FieldError.displayName = "FieldError";
