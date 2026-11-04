import { describe, expect, it } from "vitest";

import { cn } from "./cn.js";

describe("cn", () => {
  it("merges conditional classes and lets consumer utilities override Ajna defaults", () => {
    const classes = cn(
      "h-9 rounded-ajna-base bg-ajna-primary px-3 text-sm",
      false,
      null,
      undefined,
      ["h-12", { "px-6": true, hidden: false }],
      "rounded-full bg-red-600",
    );
    expect(classes).toBe("text-sm h-12 px-6 rounded-full bg-red-600");
  });

  it("keeps state variants and independent utility groups", () => {
    expect(
      cn("text-sm hover:bg-ajna-primary", "text-white hover:bg-red-600"),
    ).toBe("text-sm text-white hover:bg-red-600");
  });
});
