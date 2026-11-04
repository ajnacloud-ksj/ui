import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator.js";

describe("Separator", () => {
  it("exposes its orientation and forwards the native ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<Separator ref={ref} />);
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe(
      "horizontal",
    );
    expect(ref.current).toBe(screen.getByRole("separator"));
    rerender(<Separator orientation="vertical" />);
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });
  it("allows explicitly decorative separators and custom elements", () => {
    render(
      <Separator
        role="presentation"
        aria-hidden="true"
        render={<hr />}
        data-testid="rule"
      />,
    );
    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByTestId("rule").tagName).toBe("HR");
  });
});
