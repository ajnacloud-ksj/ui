import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { Toggle } from ".";

it("preserves pressed state, refs, keyboard activation, and function class names", async () => {
  const ref = createRef<HTMLButtonElement>();
  const onChange = vi.fn();
  render(
    <Toggle
      ref={ref}
      defaultPressed
      onPressedChange={onChange}
      className={(state) => (state.pressed ? "selected" : "idle")}
    >
      Bold
    </Toggle>,
  );
  const toggle = screen.getByRole("button", { name: "Bold" });
  expect(ref.current).toBe(toggle);
  expect(toggle.getAttribute("aria-pressed")).toBe("true");
  expect(toggle.classList.contains("selected")).toBe(true);
  await userEvent.tab();
  await userEvent.keyboard(" ");
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
  expect(toggle.classList.contains("idle")).toBe(true);
  expect(onChange.mock.calls[0]?.[0]).toBe(false);
});

it("supports application-owned state without submitting a surrounding form", async () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  function Example() {
    const [pressed, setPressed] = useState(false);
    return (
      <form onSubmit={submit}>
        <Toggle pressed={pressed} onPressedChange={setPressed}>
          Bookmark
        </Toggle>
      </form>
    );
  }
  render(<Example />);
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  expect(submit).not.toHaveBeenCalled();
});

it("preserves disabled and canceled interactions", async () => {
  const disabledChange = vi.fn();
  render(
    <>
      <Toggle disabled onPressedChange={disabledChange}>
        Disabled
      </Toggle>
      <Toggle onPressedChange={(_, details) => details.cancel()}>
        Canceled
      </Toggle>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Disabled" }));
  await userEvent.click(screen.getByRole("button", { name: "Canceled" }));
  expect(disabledChange).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole("button", { name: "Canceled" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
});
