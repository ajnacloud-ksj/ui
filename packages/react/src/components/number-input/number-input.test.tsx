import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { NumberInput } from ".";

it("preserves uncontrolled defaults, visible refs, labels, native form values", async () => {
  const ref = createRef<HTMLInputElement>();
  const hidden = createRef<HTMLInputElement>();
  const view = render(
    <form>
      <label htmlFor="quantity">Quantity</label>
      <NumberInput
        id="quantity"
        name="quantity"
        defaultValue={3}
        ref={ref}
        inputRef={hidden}
        aria-describedby="quantity-help"
      />
      <p id="quantity-help">Items to order.</p>
    </form>,
  );
  const input = screen.getByLabelText("Quantity") as HTMLInputElement;
  expect(input.value).toBe("3");
  expect(ref.current).toBe(input);
  expect(hidden.current).not.toBe(input);
  expect(input.getAttribute("aria-describedby")).toBe("quantity-help");
  await userEvent.click(screen.getByText("Quantity"));
  expect(document.activeElement).toBe(input);
  await userEvent.clear(input);
  await userEvent.type(input, "7");
  expect(
    new FormData(view.container.querySelector("form")!).get("quantity"),
  ).toBe("7");
});

it("keeps numeric controlled values, empty null, bounds, step buttons, and commit callbacks", async () => {
  const changed = vi.fn();
  const committed = vi.fn();
  function Example() {
    const [value, setValue] = useState<number | null>(1);
    return (
      <NumberInput
        aria-label="Weight"
        value={value}
        onValueChange={(next, details) => {
          changed(next, details.reason);
          setValue(next);
        }}
        onValueCommitted={committed}
        min={0}
        max={2}
        step={0.5}
        suffix="kg"
        showControls
      />
    );
  }
  render(<Example />);
  const input = screen.getByLabelText("Weight") as HTMLInputElement;
  await userEvent.click(screen.getByRole("button", { name: "Increase value" }));
  expect(input.value).toBe("1.5");
  expect(committed).toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Increase value" }));
  expect(input.value).toBe("2");
  expect(
    screen
      .getByRole("button", { name: "Increase value" })
      .hasAttribute("disabled"),
  ).toBe(true);
  await userEvent.clear(input);
  expect(changed.mock.lastCall?.[0]).toBeNull();
  expect(input.value).toBe("");
});

it("formats for the selected locale while submitting a raw numeric value", () => {
  const view = render(
    <form>
      <NumberInput
        aria-label="Price"
        name="price"
        defaultValue={1234.5}
        locale="en-US"
        format={{ style: "currency", currency: "USD" }}
        aria-invalid="true"
      />
    </form>,
  );
  expect((screen.getByLabelText("Price") as HTMLInputElement).value).toBe(
    "$1,234.50",
  );
  expect(screen.getByLabelText("Price").getAttribute("aria-invalid")).toBe(
    "true",
  );
  expect(new FormData(view.container.querySelector("form")!).get("price")).toBe(
    "1234.5",
  );
});

it("keeps disabled and read-only controls immutable and honors canceled changes", async () => {
  const change = vi.fn();
  render(
    <>
      <NumberInput
        aria-label="Disabled"
        disabled
        defaultValue={3}
        showControls
      />
      <NumberInput
        aria-label="Read only"
        readOnly
        defaultValue={4}
        showControls
      />
      <NumberInput
        aria-label="Canceled"
        defaultValue={5}
        onValueChange={(value, details) => {
          change(value);
          details.cancel();
        }}
      />
    </>,
  );
  for (const name of ["Disabled", "Read only"]) {
    const input = screen.getByLabelText(name) as HTMLInputElement;
    await userEvent.type(input, "9");
    expect(input.value).toBe(name === "Disabled" ? "3" : "4");
  }
  const canceled = screen.getByLabelText("Canceled") as HTMLInputElement;
  await userEvent.click(canceled);
  await userEvent.keyboard("{ArrowUp}");
  expect(change).toHaveBeenCalled();
  expect(canceled.value).toBe("5");
});
