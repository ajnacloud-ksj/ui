"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
} from "react";

import { cn } from "@/utils";

export type IconStackProps = ComponentPropsWithoutRef<"div">;

export const IconStack = forwardRef<HTMLDivElement, IconStackProps>(
  function IconStack({ className, children, style, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-ajna-component="icon-stack"
        data-slot="icon-stack"
        className={cn(
          "relative box-border h-20 w-[4.5rem] text-ajna-foreground",
          className,
        )}
        style={
          {
            "--ajna-icon-stack-content-x": "71%",
            "--ajna-icon-stack-content-y": "58%",
            ...style,
          } as CSSProperties
        }
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 72 81"
          fill="none"
          data-ajna-component="icon-stack-svg"
          className="block h-full w-full overflow-visible"
        >
          <ellipse
            cx="36"
            cy="76"
            rx="30"
            ry="7"
            fill="currentColor"
            fillOpacity="0.055"
            data-ajna-component="icon-stack-shadow"
            className="blur-[4px]"
          />

          <IconStackLayer opacity={0.4} />
          <IconStackLayer opacity={0.6} x={13.65} y={6.04} />
          <IconStackLayer opacity={0.8} x={27.32} y={12.08} active />
        </svg>

        {children ? (
          <div
            data-ajna-component="icon-stack-content"
            data-slot="icon-stack-content"
            className="pointer-events-none absolute left-[var(--ajna-icon-stack-content-x)] top-[var(--ajna-icon-stack-content-y)] flex -translate-x-1/2 -translate-y-1/2 -skew-y-[26deg] scale-x-90 items-center justify-center"
          >
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);
IconStack.displayName = "IconStack";

function IconStackLayer({
  active = false,
  opacity,
  x = 0,
  y = 0,
}: {
  active?: boolean;
  opacity: number;
  x?: number;
  y?: number;
}) {
  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y})`}
      data-ajna-component="icon-stack-layer"
      className="fill-ajna-background"
    >
      <path
        data-slot="icon-stack-layer"
        d="M42.2538 2.046C41.4408 1.6325 40.3965 1.6677 39.2612 2.2424L7.9616 18.1934C5.3895 19.5039 3.301 23.1064 3.301 26.2322V64.3226C3.301 66.0677 3.9458 67.2943 4.962 67.8199L1.8363 66.229C0.8201 65.7104 0.1753 64.4771 0.1753 62.732V24.6412C0.1753 21.5085 2.2638 17.913 4.8359 16.6024L36.1355 0.6515C37.2778 0.0698 38.322 0.0416 39.128 0.4551L42.2538 2.046Z"
        stroke="currentColor"
        strokeOpacity={active ? 0.3 : 0.2}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-slot="icon-stack-layer"
        d="M42.2545 2.0456C43.2707 2.5643 43.9155 3.7979 43.9155 5.543V43.6337C43.9155 46.7665 41.827 50.3616 39.2549 51.6722L7.9554 67.6235C6.813 68.2052 5.7687 68.2331 4.9628 67.8196C3.9465 67.301 3.3018 66.0673 3.3018 64.3222V26.2318C3.3018 23.0991 5.3903 19.5036 7.9624 18.193L39.2619 2.2421C40.4043 1.6604 41.4486 1.6321 42.2545 2.0456Z"
        stroke="currentColor"
        strokeOpacity={active ? 0.3 : 0.2}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
