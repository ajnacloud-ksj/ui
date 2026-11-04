"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

const sizes = {
  sm: "h-6 w-6 text-xs",
  base: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
} as const;
export type AvatarSize = keyof typeof sizes;
export interface AvatarProps extends ComponentPropsWithoutRef<
  typeof BaseAvatar.Root
> {
  size?: AvatarSize;
}
export type AvatarImageProps = ComponentPropsWithoutRef<
  typeof BaseAvatar.Image
>;
export type AvatarFallbackProps = ComponentPropsWithoutRef<
  typeof BaseAvatar.Fallback
>;
export type AvatarBadgeProps = ComponentPropsWithoutRef<"span">;
export type AvatarGroupProps = ComponentPropsWithoutRef<"div">;
export interface AvatarGroupCountProps extends ComponentPropsWithoutRef<"span"> {
  size?: AvatarSize;
}

const avatarStyles = cva(
  "relative box-border inline-flex shrink-0 select-none items-center justify-center rounded-full border border-solid border-ajna-border font-ajna font-medium",
  { variants: { size: sizes }, defaultVariants: { size: "base" } },
);

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size = "base", ...props },
  ref,
) {
  const classes = cn("group/ajna-avatar", avatarStyles({ size }));
  return (
    <BaseAvatar.Root
      {...props}
      ref={ref}
      data-ajna-component="avatar"
      data-slot="avatar"
      data-size={size}
      className={
        typeof className === "function"
          ? (state) => cn(classes, className(state))
          : cn(classes, className)
      }
    />
  );
});
Avatar.displayName = "Avatar";

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, ...props }, ref) {
    const classes = "block h-full w-full rounded-[inherit] object-cover";
    return (
      <BaseAvatar.Image
        {...props}
        ref={ref}
        data-ajna-component="avatar-image"
        data-slot="avatar-image"
        className={(state) =>
          cn(
            classes,
            state.imageLoadingStatus !== "loaded" && "hidden",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, ...props }, ref) {
    const classes =
      "flex h-full w-full items-center justify-center rounded-[inherit] bg-ajna-muted text-ajna-muted-foreground";
    return (
      <BaseAvatar.Fallback
        {...props}
        ref={ref}
        data-ajna-component="avatar-fallback"
        data-slot="avatar-fallback"
        className={
          typeof className === "function"
            ? (state) => cn(classes, className(state))
            : cn(classes, className)
        }
      />
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";

export const AvatarBadge = forwardRef<HTMLSpanElement, AvatarBadgeProps>(
  function AvatarBadge({ className, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        data-ajna-component="avatar-badge"
        data-slot="avatar-badge"
        className={cn(
          "absolute bottom-0 end-0 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-ajna-success text-ajna-background ring-2 ring-ajna-background group-data-[size=lg]/ajna-avatar:h-3 group-data-[size=sm]/ajna-avatar:h-2 group-data-[size=lg]/ajna-avatar:w-3 group-data-[size=sm]/ajna-avatar:w-2 [&>svg]:h-2 [&>svg]:w-2 group-data-[size=sm]/ajna-avatar:[&>svg]:hidden",
          className,
        )}
      />
    );
  },
);
AvatarBadge.displayName = "AvatarBadge";

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="avatar-group"
        data-slot="avatar-group"
        className={cn(
          "flex items-center -space-x-2 rtl:space-x-reverse [&>[data-slot=avatar-group-count]]:ring-2 [&>[data-slot=avatar-group-count]]:ring-ajna-background [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-ajna-background",
          className,
        )}
      />
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";

export const AvatarGroupCount = forwardRef<
  HTMLSpanElement,
  AvatarGroupCountProps
>(function AvatarGroupCount({ className, size = "base", ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      data-ajna-component="avatar-group-count"
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        avatarStyles({ size }),
        "bg-ajna-muted text-ajna-muted-foreground",
        className,
      )}
    />
  );
});
AvatarGroupCount.displayName = "AvatarGroupCount";
