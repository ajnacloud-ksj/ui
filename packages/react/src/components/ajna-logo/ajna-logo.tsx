"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import theme from "@/styles/theme.json";
import { cn } from "@/utils";

import { artwork } from "./artwork";

export type AjnaLogoVariant = "full" | "glyph" | "stacked";
export type AjnaLogoColor = "brand" | "current" | "black" | "white";

export interface AjnaLogoProps extends Omit<
  ComponentPropsWithoutRef<"svg">,
  "children" | "color" | "viewBox" | "fill"
> {
  /** Horizontal wordmark, stacked wordmark, or eye symbol. @default "full" */
  variant?: AjnaLogoVariant;
  /** Brand navy, inherited text color, black, or white. @default "brand" */
  color?: AjnaLogoColor;
  /** Includes the original tagline in wordmark variants. @default false */
  tagline?: boolean;
}

const colors = {
  brand: `hsl(var(--ajna-brand-navy, ${theme.colors["brand-navy"][0]}))`,
  current: "currentColor",
  black: "#000",
  white: "#fff",
} as const;

const widths = { full: 160, stacked: 128, glyph: 48 } as const;

export const AjnaLogo = forwardRef<SVGSVGElement, AjnaLogoProps>(
  function AjnaLogo(
    {
      variant = "full",
      color = "brand",
      tagline = false,
      className,
      width,
      role = "img",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) {
    const logo = artwork[variant];
    const showTagline = tagline && variant !== "glyph";
    const decorative = ariaHidden === true || ariaHidden === "true";

    return (
      <svg
        {...props}
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={showTagline ? logo.taglineViewBox : logo.viewBox}
        width={width ?? widths[variant]}
        fill={colors[color]}
        focusable="false"
        role={decorative ? undefined : role}
        aria-label={
          decorative
            ? undefined
            : (ariaLabel ?? (ariaLabelledby ? undefined : "Ajna"))
        }
        aria-labelledby={decorative ? undefined : ariaLabelledby}
        aria-hidden={ariaHidden}
        data-ajna-component="ajna-logo"
        data-slot="ajna-logo"
        className={cn(
          "inline-block h-auto max-w-full shrink-0 align-middle",
          className,
        )}
      >
        <path d={logo.path} />
        {showTagline && (
          <path
            d={logo.taglinePath}
            fill={
              color === "brand"
                ? `hsl(var(--ajna-brand-orange, ${theme.colors["brand-orange"][0]}))`
                : colors[color]
            }
          />
        )}
      </svg>
    );
  },
);
AjnaLogo.displayName = "AjnaLogo";
