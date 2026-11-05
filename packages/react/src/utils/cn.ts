import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: { borderRadius: ["ajna-sm", "ajna-md", "ajna-base", "ajna-lg"] },
    classGroups: {
      duration: [(value: string) => /^\[transition-duration:.+\]$/.test(value)],
      ease: [
        (value: string) => /^\[transition-timing-function:.+\]$/.test(value),
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
