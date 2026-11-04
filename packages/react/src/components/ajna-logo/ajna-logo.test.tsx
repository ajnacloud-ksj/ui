import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";

import { AjnaLogo } from ".";

it("provides an accessible name, forwards refs, and supports labelled or decorative use", () => {
  const ref = createRef<SVGSVGElement>();
  const view = render(<AjnaLogo ref={ref} />);
  expect(ref.current).toBe(screen.getByRole("img", { name: "Ajna" }));
  view.rerender(<AjnaLogo aria-label="Ajna home" />);
  expect(screen.getByRole("img", { name: "Ajna home" })).toBeTruthy();
  view.rerender(
    <>
      <span id="brand-name">Ajna UI</span>
      <AjnaLogo aria-labelledby="brand-name" />
    </>,
  );
  expect(
    screen.getByRole("img", { name: "Ajna UI" }).getAttribute("aria-label"),
  ).toBeNull();
  view.rerender(<AjnaLogo aria-hidden="true" aria-label="Ajna home" />);
  expect(screen.queryByRole("img")).toBeNull();
  expect(
    view.container.querySelector("svg")?.getAttribute("aria-label"),
  ).toBeNull();
});

it("inherits a single color and keeps the original tagline optional", () => {
  const view = render(<AjnaLogo color="current" tagline width={240} />);
  const logo = screen.getByRole("img");
  expect(logo.getAttribute("fill")).toBe("currentColor");
  expect(logo.getAttribute("width")).toBe("240");
  expect(logo.querySelectorAll("path")).toHaveLength(2);
  expect(logo.querySelectorAll("path")[1].getAttribute("fill")).toBe(
    "currentColor",
  );
  view.rerender(<AjnaLogo variant="glyph" tagline />);
  expect(screen.getByRole("img").querySelectorAll("path")).toHaveLength(1);
});

it("uses the shared brand tokens for the glyph and optional tagline", () => {
  const view = render(<AjnaLogo variant="glyph" />);
  expect(screen.getByRole("img").getAttribute("fill")).toContain(
    "var(--ajna-brand-navy,",
  );
  view.rerender(<AjnaLogo tagline />);
  expect(
    screen.getByRole("img").querySelectorAll("path")[1].getAttribute("fill"),
  ).toContain("var(--ajna-brand-orange,");
});
