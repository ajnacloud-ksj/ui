import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Field as BaseField } from "@base-ui/react/field";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import { Slider, SliderLabel, SliderValue } from ".";

beforeEach(() => {
  // jsdom has no layout; edge-aligned thumbs need measurable bounds to become visible.
  const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.dataset.slot === "slider-thumb")
        return new DOMRect(0, 0, 16, 16);
      if (this.dataset.slot === "slider-control")
        return this.getAttribute("data-orientation") === "vertical"
          ? new DOMRect(0, 0, 20, 200)
          : new DOMRect(0, 0, 200, 20);
      return getBoundingClientRect.call(this);
    },
  );
});

it("labels a single thumb, focuses it from its label, and supports stepping and commits", async () => {
  const ref = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  const onValueCommitted = vi.fn();
  render(
    <Slider
      ref={ref}
      defaultValue={40}
      step={5}
      largeStep={20}
      onValueCommitted={onValueCommitted}
      thumbProps={{ inputRef }}
    >
      <SliderLabel>Volume</SliderLabel>
      <SliderValue />
    </Slider>,
  );
  const user = userEvent.setup();
  const thumb = await screen.findByRole("slider", { name: "Volume" });
  expect(inputRef.current).toBe(thumb);
  expect(ref.current?.getAttribute("data-slot")).toBe("slider");
  await user.click(screen.getByText("Volume", { exact: true }));
  expect(document.activeElement).toBe(thumb);
  await user.keyboard("{ArrowRight}");
  expect((thumb as HTMLInputElement).value).toBe("45");
  expect(onValueCommitted.mock.lastCall?.[0]).toBe(45);
  await user.keyboard("{PageUp}");
  expect((thumb as HTMLInputElement).value).toBe("65");
  await user.keyboard("{End}");
  expect((thumb as HTMLInputElement).value).toBe("100");
  await user.keyboard("{Home}");
  expect((thumb as HTMLInputElement).value).toBe("0");
});

it("starts with one thumb at the minimum value", async () => {
  render(<Slider min={10} max={50} aria-label="Starting value" />);
  const thumb = await screen.findByRole("slider", { name: "Starting value" });
  expect((thumb as HTMLInputElement).value).toBe("10");
  expect(screen.getAllByRole("slider")).toHaveLength(1);
  expect(thumb.getAttribute("aria-orientation")).toBe("horizontal");
});

it("connects Base UI field validation to its actual range input", async () => {
  render(
    <BaseField.Root invalid>
      <Slider
        defaultValue={40}
        aria-label="Invalid amount"
        aria-describedby="amount-error"
      />
      <div id="amount-error">Choose an amount above 50.</div>
    </BaseField.Root>,
  );
  const thumb = await screen.findByRole("slider", { name: "Invalid amount" });
  expect(thumb.getAttribute("aria-invalid")).toBe("true");
  expect(thumb.getAttribute("aria-describedby")).toBe("amount-error");
});

it("keeps controlled range values, per-thumb names, and submitted values in sync", async () => {
  function Range() {
    const [value, setValue] = useState([20, 80]);
    return (
      <form>
        <Slider
          name="budget"
          value={value}
          onValueChange={setValue}
          minStepsBetweenValues={5}
          step={2}
          thumbProps={{
            getAriaLabel: (index) =>
              index === 0 ? "Minimum budget" : "Maximum budget",
            getAriaValueText: (_, next) => `$${next}`,
          }}
        >
          <SliderLabel>Budget</SliderLabel>
          <SliderValue />
        </Slider>
      </form>
    );
  }
  const { container } = render(<Range />);
  const minimum = await screen.findByRole("slider", { name: "Minimum budget" });
  const maximum = screen.getByRole("slider", { name: "Maximum budget" });
  expect(minimum.hasAttribute("aria-labelledby")).toBe(false);
  minimum.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect((minimum as HTMLInputElement).value).toBe("22");
  expect(minimum.getAttribute("aria-valuetext")).toBe("$22");
  expect((maximum as HTMLInputElement).value).toBe("80");
  expect(
    new FormData(container.querySelector("form")!).getAll("budget"),
  ).toEqual(["22", "80"]);
  expect(screen.getByText("22 – 80")).toBeTruthy();
});

it("supports vertical and RTL keyboard changes and keeps disabled thumbs out of forms", async () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <form>
      <Slider
        disabled
        name="disabled"
        defaultValue={50}
        aria-label="Disabled"
        onValueChange={onValueChange}
      />
      <Slider orientation="vertical" defaultValue={50} aria-label="Vertical" />
      <DirectionProvider direction="rtl">
        <Slider defaultValue={50} aria-label="RTL" />
      </DirectionProvider>
    </form>,
  );
  const disabled = await screen.findByRole("slider", { name: "Disabled" });
  expect((disabled as HTMLInputElement).disabled).toBe(true);
  expect(new FormData(container.querySelector("form")!).has("disabled")).toBe(
    false,
  );
  const vertical = screen.getByRole("slider", { name: "Vertical" });
  expect(vertical.getAttribute("aria-orientation")).toBe("vertical");
  vertical.focus();
  await userEvent.keyboard("{ArrowUp}");
  expect((vertical as HTMLInputElement).value).toBe("51");
  const rtl = screen.getByRole("slider", { name: "RTL" });
  rtl.focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect((rtl as HTMLInputElement).value).toBe("51");
  expect(onValueChange).not.toHaveBeenCalled();
});

it("renders the right number of thumbs in server HTML and reacts to a controlled range changing length", async () => {
  const html = renderToString(
    <Slider value={[10, 30, 80]} aria-label="Breakpoints" />,
  );
  expect(
    new DOMParser()
      .parseFromString(html, "text/html")
      .querySelectorAll('input[type="range"]'),
  ).toHaveLength(3);
  const { rerender } = render(<Slider value={[10, 80]} aria-label="Range" />);
  expect(await screen.findAllByRole("slider")).toHaveLength(2);
  rerender(<Slider value={[10, 30, 80]} aria-label="Range" />);
  await waitFor(() => expect(screen.getAllByRole("slider")).toHaveLength(3));
});
