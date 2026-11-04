import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";

import { Progress, ProgressLabel, ProgressValue } from ".";

it("associates its label, formats completion, forwards a ref, and sizes the indicator", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <Progress ref={ref} value={6} max={8}>
      <ProgressLabel>Upload</ProgressLabel>
      <ProgressValue />
    </Progress>,
  );
  const progress = screen.getByRole("progressbar", { name: "Upload" });
  expect(ref.current).toBe(progress);
  expect(progress.getAttribute("aria-valuenow")).toBe("6");
  expect(progress.getAttribute("aria-valuemax")).toBe("8");
  expect(progress.getAttribute("aria-valuetext")).toBe("75%");
  expect(
    container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
      ?.style.width,
  ).toBe("75%");
});

it("handles nonzero bounds and clamps values consistently with the accessible value", () => {
  const { rerender, container } = render(
    <Progress value={30} min={20} max={40} aria-label="Import" />,
  );
  expect(
    container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
      ?.style.width,
  ).toBe("50%");
  rerender(<Progress value={60} min={20} max={40} aria-label="Import" />);
  const progress = screen.getByRole("progressbar", { name: "Import" });
  expect(progress.getAttribute("aria-valuenow")).toBe("40");
  expect(progress.hasAttribute("data-complete")).toBe(true);
  expect(
    container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
      ?.style.width,
  ).toBe("100%");
});

it("exposes indeterminate work without a fabricated value and updates to known progress", () => {
  const { rerender } = render(
    <Progress value={null} aria-label="Import" aria-valuetext="Preparing files">
      <ProgressValue>
        {(_, value) => (value === null ? "Preparing…" : `${value} files`)}
      </ProgressValue>
    </Progress>,
  );
  const progress = screen.getByRole("progressbar", { name: "Import" });
  expect(progress.hasAttribute("aria-valuenow")).toBe(false);
  expect(progress.hasAttribute("data-indeterminate")).toBe(true);
  expect(progress.getAttribute("aria-valuetext")).toBe("Preparing files");
  expect(screen.getByText("Preparing…")).toBeTruthy();
  rerender(
    <Progress
      value={5}
      max={10}
      aria-label="Import"
      getAriaValueText={(_, value) => `${value} of 10 files`}
    >
      <ProgressValue>{(_, value) => `${value} files`}</ProgressValue>
    </Progress>,
  );
  expect(progress.getAttribute("aria-valuetext")).toBe("5 of 10 files");
  expect(screen.getByText("5 files")).toBeTruthy();
});

it.each([null, undefined, NaN, Infinity])(
  "uses two decorative sweeps for unknown progress: %s",
  (value) => {
    const { container, rerender } = render(
      <Progress value={value as number | null} aria-label="Loading" />,
    );
    expect(screen.getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(
      false,
    );
    const sweeps = container.querySelectorAll('[data-slot="progress-sweep"]');
    expect(sweeps).toHaveLength(2);
    sweeps.forEach((sweep) =>
      expect(sweep.getAttribute("aria-hidden")).toBe("true"),
    );
    rerender(<Progress value={0} aria-label="Loading" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
    expect(
      container.querySelectorAll('[data-slot="progress-sweep"]'),
    ).toHaveLength(0);
  },
);
