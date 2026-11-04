"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactElement,
  type RefAttributes,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { cn } from "@/utils";

export type TooltipRootProps<Payload = unknown> =
  BaseTooltip.Root.Props<Payload>;
export type TooltipTriggerProps<Payload = unknown> = Omit<
  BaseTooltip.Trigger.Props<Payload>,
  "ref"
>;
export type TooltipProviderProps = BaseTooltip.Provider.Props;
export interface TooltipContentProps
  extends
    ComponentPropsWithoutRef<typeof BaseTooltip.Popup>,
    Pick<
      BaseTooltip.Positioner.Props,
      | "side"
      | "align"
      | "sideOffset"
      | "alignOffset"
      | "collisionPadding"
      | "collisionBoundary"
    > {
  /** Portal destination. Defaults to document.body. */
  container?: BaseTooltip.Portal.Props["container"];
  keepMounted?: boolean;
  /** Show the decorative arrow. @default true */
  showArrow?: boolean;
}

const contentClasses =
  "box-border w-max max-w-[min(20rem,var(--available-width))] origin-[var(--transform-origin)] break-words rounded-ajna-md border border-solid border-ajna-border bg-ajna-popover px-2.5 py-1.5 font-ajna text-xs leading-5 text-ajna-popover-foreground shadow-md transition-[opacity,transform] duration-150 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none motion-reduce:transition-none";

// Base UI 1.9 omits the tooltip role and description link.
const TooltipContext = createContext<{
  open: boolean;
  contentId: string;
  setContentId: (id: string) => void;
} | null>(null);

function TooltipRoot<Payload>({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: TooltipRootProps<Payload>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [contentId, setContentId] = useState(useId());
  const open = controlledOpen ?? internalOpen;
  const enabledOpen = open && !props.disabled;
  const context = useMemo(
    () => ({ open: enabledOpen, contentId, setContentId }),
    [enabledOpen, contentId],
  );
  return (
    <TooltipContext.Provider value={context}>
      <BaseTooltip.Root
        {...props}
        open={open}
        onOpenChange={(nextOpen, details) => {
          onOpenChange?.(nextOpen, details);
          if (!details.isCanceled) setInternalOpen(nextOpen);
        }}
      />
    </TooltipContext.Provider>
  );
}

const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger(props, ref) {
    const context = useContext(TooltipContext);
    const describedBy =
      context?.open && !props.disabled
        ? [props["aria-describedby"], context.contentId]
            .filter(Boolean)
            .join(" ")
        : props["aria-describedby"];
    return (
      <BaseTooltip.Trigger
        {...props}
        ref={ref as RefAttributes<HTMLButtonElement>["ref"]}
        aria-describedby={describedBy}
      />
    );
  },
) as <Payload = unknown>(
  props: TooltipTriggerProps<Payload> & RefAttributes<HTMLElement>,
) => ReactElement;

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    {
      side = "top",
      align = "center",
      sideOffset = 8,
      alignOffset = 0,
      collisionPadding = 8,
      collisionBoundary,
      container,
      keepMounted,
      showArrow = true,
      className,
      children,
      id: idProp,
      ...props
    },
    ref,
  ) {
    const context = useContext(TooltipContext);
    const fallbackId = useId();
    const id = idProp ?? context?.contentId ?? fallbackId;
    const setContentId = context?.setContentId;
    useEffect(() => {
      setContentId?.(id);
    }, [id, setContentId]);
    return (
      <BaseTooltip.Portal container={container} keepMounted={keepMounted}>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          collisionBoundary={collisionBoundary}
          data-ajna-component="tooltip-positioner"
          className="isolate z-[1200]"
        >
          <BaseTooltip.Popup
            role="tooltip"
            {...props}
            id={id}
            ref={ref}
            data-ajna-component="tooltip-content"
            data-slot="tooltip-content"
            className={
              typeof className === "function"
                ? (state) => cn(contentClasses, className(state))
                : cn(contentClasses, className)
            }
          >
            {children}
            {showArrow && (
              <BaseTooltip.Arrow
                data-ajna-component="tooltip-arrow"
                className="pointer-events-none h-2 w-2 rotate-45 border border-solid border-ajna-border bg-ajna-popover data-[side=bottom]:-top-[5px] data-[side=left]:-right-[5px] data-[side=right]:-left-[5px] data-[side=top]:-bottom-[5px] data-[side=bottom]:border-b-0 data-[side=bottom]:border-r-0 data-[side=left]:border-b-0 data-[side=left]:border-l-0 data-[side=right]:border-r-0 data-[side=right]:border-t-0 data-[side=top]:border-l-0 data-[side=top]:border-t-0"
              />
            )}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);
TooltipContent.displayName = "Tooltip.Content";

export const Tooltip = {
  Root: TooltipRoot,
  Provider: BaseTooltip.Provider,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
