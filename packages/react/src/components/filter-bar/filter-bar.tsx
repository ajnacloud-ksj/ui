"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { SlidersHorizontal, X } from "lucide-react";
import {
  forwardRef,
  type ReactElement,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocale } from "react-aria-components";

import { Button } from "@/components/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/drawer";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/utils";

import type { FilterBarProps } from "./filter-bar.types";
import { FilterBarPanel } from "./filter-bar-panel";
import {
  activeLabel,
  defaultMessages,
  type RuntimeFilter,
  type RuntimeValues,
  valuesEqual,
} from "./filter-bar-state";

const mobileQuery = "(max-width: 767px)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getMobile = () => window.matchMedia(mobileQuery).matches;
const getServerMobile = () => false;
type RuntimeProps = Omit<FilterBarProps<RuntimeValues>, "filters"> & {
  filters: readonly RuntimeFilter[];
};

const FilterBarRoot = forwardRef<HTMLElement, RuntimeProps>(function FilterBar(
  {
    filters,
    value,
    resetValue,
    onValueChange,
    search,
    actions,
    applyMode = "instant",
    disabled = false,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    panelSide = "responsive",
    panelProps,
    triggerProps,
    locale: localeProp,
    formatDate,
    messages: messageOverrides,
    classNames = {},
    className,
    ...props
  },
  ref,
) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());
  const direction = useDirection();
  const context = useLocale();
  const locale = localeProp ?? context.locale;
  const mobile = useSyncExternalStore(subscribe, getMobile, getServerMobile);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const side =
    panelSide === "responsive"
      ? mobile
        ? "bottom"
        : direction === "rtl"
          ? "left"
          : "right"
      : panelSide;
  const messages = { ...defaultMessages, ...messageOverrides };
  const ids = new Set<string>();
  for (const filter of filters) {
    if (ids.has(filter.id))
      throw new Error(`FilterBar requires unique filter IDs: "${filter.id}".`);
    if (
      !Object.prototype.hasOwnProperty.call(value, filter.id) ||
      !Object.prototype.hasOwnProperty.call(resetValue, filter.id)
    )
      throw new Error(
        `FilterBar requires value and resetValue entries for "${filter.id}".`,
      );
    ids.add(filter.id);
  }
  const active = filters.filter(
    (filter) =>
      filter.isActive?.(value[filter.id], resetValue[filter.id]) ??
      !valuesEqual(filter, value[filter.id], resetValue[filter.id]),
  );
  const clearable = active.filter((filter) => !disabled && !filter.disabled);
  const { className: panelClassName, ...contentProps } = panelProps ?? {};
  const searchProps = search
    ? (({ value: query, onValueChange: onQueryChange, ...rest }) => ({
        ...rest,
        value: query,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onQueryChange(event.currentTarget.value),
      }))(search)
    : null;
  return (
    <section
      {...props}
      ref={ref}
      aria-label={props["aria-label"] ?? messages.listControls}
      data-ajna-component="filter-bar"
      data-slot="filter-bar"
      className={cn(
        "space-y-3 font-ajna text-sm leading-5 text-ajna-foreground",
        className,
      )}
    >
      <div
        data-ajna-component="filter-bar-toolbar"
        className={cn("flex flex-wrap items-center gap-2", classNames.toolbar)}
      >
        {searchProps && (
          <SearchInput
            {...searchProps}
            aria-label={searchProps["aria-label"] ?? messages.search}
            placeholder={searchProps.placeholder ?? messages.search}
            disabled={disabled || searchProps.disabled}
            containerProps={{
              ...searchProps.containerProps,
              className: cn(
                "basis-full md:w-auto md:min-w-56 md:flex-1 md:basis-0",
                classNames.search,
                searchProps.containerProps?.className,
              ),
            }}
          />
        )}
        {filters.length > 0 && (
          <Drawer
            open={open}
            onOpenChange={(next, details) => {
              onOpenChange?.(next, details);
              if (!details.isCanceled) setUncontrolledOpen(next);
            }}
            swipeDirection={side === "bottom" ? "down" : side}
            showSwipeHandle={side === "bottom"}
          >
            <DrawerTrigger
              disabled={disabled}
              render={
                <Button
                  ref={trigger}
                  {...triggerProps}
                  shape="base"
                  type="button"
                  disabled={disabled}
                  variant={triggerProps?.variant ?? "outline"}
                  className={cn(classNames.trigger, triggerProps?.className)}
                />
              }
            >
              <SlidersHorizontal
                aria-hidden="true"
                data-ajna-component="filter-bar-trigger-icon"
                className="h-4 w-4"
              />
              {messages.filters}
              {active.length > 0 && (
                <>
                  <span
                    aria-hidden="true"
                    data-ajna-component="filter-bar-count"
                    className="flex h-5 min-w-5 items-center justify-center rounded-ajna-sm bg-ajna-muted px-1 text-xs tabular-nums"
                  >
                    {active.length}
                  </span>
                  <span
                    data-ajna-component="filter-bar-count-label"
                    className="sr-only"
                  >
                    {messages.activeCount(active.length)}
                  </span>
                </>
              )}
            </DrawerTrigger>
            <DrawerContent
              {...contentProps}
              dir={direction}
              className={
                typeof panelClassName === "function"
                  ? (state) =>
                      cn(
                        "min-h-0 p-0",
                        side === "bottom"
                          ? "[--ajna-drawer-content-height:85dvh] [--ajna-drawer-content-max-height:85dvh]"
                          : "w-full max-w-sm",
                        classNames.panel,
                        panelClassName(state),
                      )
                  : cn(
                      "min-h-0 p-0",
                      side === "bottom"
                        ? "[--ajna-drawer-content-height:85dvh] [--ajna-drawer-content-max-height:85dvh]"
                        : "w-full max-w-sm",
                      classNames.panel,
                      panelClassName,
                    )
              }
            >
              <FilterBarPanel
                key={`${open}:${applyMode}`}
                filters={filters}
                value={value}
                resetValue={resetValue}
                applyMode={applyMode}
                disabled={disabled}
                locale={locale}
                id={id}
                messages={messages}
                classNames={classNames}
                onChange={(next, reason, filterId) =>
                  onValueChange(next, { reason, filterId })
                }
              />
            </DrawerContent>
          </Drawer>
        )}
        {actions && (
          <div
            data-ajna-component="filter-bar-actions"
            className={cn(
              "ms-auto flex flex-wrap items-center gap-2",
              classNames.actions,
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {active.length > 0 && (
        <div
          role="group"
          aria-label={messages.activeFilters}
          data-ajna-component="filter-bar-active-filters"
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            classNames.activeFilters,
          )}
        >
          {active.map((filter, index) => (
            <Button
              key={filter.id}
              ref={(node) => {
                if (node) chipRefs.current.set(filter.id, node);
                else chipRefs.current.delete(filter.id);
              }}
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || filter.disabled}
              aria-label={messages.removeFilter(filter.label)}
              className={cn(
                "h-auto min-h-7 max-w-full gap-1.5 py-1",
                classNames.chip,
              )}
              onClick={() => {
                const next = [
                  ...active.slice(index + 1),
                  ...active.slice(0, index).reverse(),
                ].find((item) => !item.disabled);
                (next
                  ? chipRefs.current.get(next.id)
                  : trigger.current
                )?.focus();
                onValueChange(
                  { ...value, [filter.id]: resetValue[filter.id] },
                  { reason: "clear", filterId: filter.id },
                );
              }}
            >
              <span
                data-ajna-component="filter-bar-chip-label"
                className="min-w-0 truncate"
              >
                {activeLabel(
                  filter,
                  value[filter.id],
                  messages,
                  locale,
                  formatDate,
                )}
              </span>
              <X
                aria-hidden="true"
                data-ajna-component="filter-bar-chip-icon"
                className="h-3.5 w-3.5 shrink-0"
              />
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={clearable.length === 0}
            className={cn(clearable.length > 0 && "text-ajna-destructive-text")}
            onClick={() => {
              trigger.current?.focus();
              const next = { ...value };
              for (const filter of clearable)
                next[filter.id] = resetValue[filter.id];
              onValueChange(next, { reason: "clear-all" });
            }}
          >
            {messages.clearAll}
          </Button>
        </div>
      )}
    </section>
  );
});
export const FilterBar = FilterBarRoot as <Values extends object>(
  props: FilterBarProps<Values>,
) => ReactElement;
