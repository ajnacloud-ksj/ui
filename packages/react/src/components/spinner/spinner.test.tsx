import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Spinner } from ".";

describe("Spinner", () => {
  it("supports translated labels, external labels, and decorative use", () => {
    const { rerender } = render(<Spinner aria-label="Chargement" />);
    expect(screen.getByRole("status", { name: "Chargement" })).toBeTruthy();
    rerender(
      <>
        <span id="loading-label">Loading projects</span>
        <Spinner aria-labelledby="loading-label" />
      </>,
    );
    expect(
      screen
        .getByRole("status", { name: "Loading projects" })
        .hasAttribute("aria-label"),
    ).toBe(false);
    rerender(<Spinner aria-hidden="true" data-testid="decorative" />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("decorative").hasAttribute("aria-label")).toBe(
      false,
    );
  });

  it("forwards the SVG ref and native presentation attributes", () => {
    const ref = createRef<SVGSVGElement>();
    render(
      <Spinner
        ref={ref}
        aria-label="Loading files"
        aria-describedby="loading-help"
        className="align-top"
        style={{ color: "red" }}
      />,
    );
    const spinner = screen.getByRole("status", { name: "Loading files" });
    expect(ref.current).toBe(spinner);
    expect(spinner.getAttribute("aria-describedby")).toBe("loading-help");
    expect(spinner.getAttribute("stroke")).toBe("currentColor");
    expect(spinner.getAttribute("focusable")).toBe("false");
    expect(spinner.classList.contains("align-top")).toBe(true);
    expect(spinner.classList.contains("align-middle")).toBe(false);
  });
});
